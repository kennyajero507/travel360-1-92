
import { supabase } from '../integrations/supabase/client';
import { ErrorHandler } from '../utils/errorHandler';

export interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  quotes: {
    total: number;
    sent: number;
    approved: number;
    conversionRate: number;
  };
  inquiries: {
    total: number;
    new: number;
    inProgress: number;
    converted: number;
  };
  topDestinations: Array<{
    destination: string;
    bookings: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    bookings: number;
    revenue: number;
    quotes: number;
    inquiries: number;
  }>;
}

export const analyticsService = {
  async getAnalyticsData(orgId: string): Promise<AnalyticsData | null> {
    try {
      console.log('[AnalyticsService] Fetching analytics data for org:', orgId);

      // Get organization users
      const { data: orgUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('org_id', orgId);

      if (usersError) {
        ErrorHandler.handleSupabaseError(usersError, 'Fetching organization users');
        return null;
      }

      const userIds = orgUsers.map(u => u.id);

      if (userIds.length === 0) {
        return this.getEmptyAnalyticsData();
      }

      // Fetch all data in parallel
      const [
        bookingsData,
        quotesData,
        inquiriesData,
        revenueData,
        destinationsData,
        trendsData
      ] = await Promise.all([
        this.getBookingsAnalytics(userIds),
        this.getQuotesAnalytics(userIds),
        this.getInquiriesAnalytics(userIds),
        this.getRevenueAnalytics(userIds),
        this.getTopDestinations(userIds),
        this.getMonthlyTrends(userIds)
      ]);

      return {
        revenue: revenueData,
        bookings: bookingsData,
        quotes: quotesData,
        inquiries: inquiriesData,
        topDestinations: destinationsData,
        monthlyTrends: trendsData
      };
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'getAnalyticsData');
      return null;
    }
  },

  async getBookingsAnalytics(userIds: string[]) {
    const { data, error } = await supabase
      .from('bookings')
      .select('status')
      .in('agent_id', userIds);

    if (error) throw error;

    const statusCounts = data.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: data.length,
      confirmed: statusCounts.confirmed || 0,
      pending: statusCounts.pending || 0,
      cancelled: statusCounts.cancelled || 0
    };
  },

  async getQuotesAnalytics(userIds: string[]) {
    const { data, error } = await supabase
      .from('quotes')
      .select('status')
      .in('created_by', userIds);

    if (error) throw error;

    const statusCounts = data.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = data.length;
    const sent = statusCounts.sent || 0;
    const approved = statusCounts.approved || 0;
    const conversionRate = sent > 0 ? (approved / sent) * 100 : 0;

    return {
      total,
      sent,
      approved,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  },

  async getInquiriesAnalytics(userIds: string[]) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('status')
      .in('created_by', userIds);

    if (error) throw error;

    const statusCounts = data.reduce((acc, inquiry) => {
      acc[inquiry.status] = (acc[inquiry.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: data.length,
      new: statusCounts.New || 0,
      inProgress: statusCounts['In Progress'] || 0,
      converted: statusCounts.Converted || 0
    };
  },

  async getRevenueAnalytics(userIds: string[]) {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    const { data, error } = await supabase
      .from('bookings')
      .select('total_price, created_at')
      .in('agent_id', userIds)
      .eq('status', 'confirmed');

    if (error) throw error;

    const total = data.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
    
    const thisMonth = data
      .filter(booking => {
        const date = new Date(booking.created_at);
        return date >= currentMonth && date < nextMonth;
      })
      .reduce((sum, booking) => sum + (booking.total_price || 0), 0);

    const lastMonthData = data
      .filter(booking => {
        const date = new Date(booking.created_at);
        return date >= lastMonth && date < currentMonth;
      })
      .reduce((sum, booking) => sum + (booking.total_price || 0), 0);

    const growth = lastMonthData > 0 ? ((thisMonth - lastMonthData) / lastMonthData) * 100 : 0;

    return {
      total,
      thisMonth,
      lastMonth: lastMonthData,
      growth: Math.round(growth * 100) / 100
    };
  },

  async getTopDestinations(userIds: string[]) {
    const { data, error } = await supabase
      .from('bookings')
      .select('hotel_name, total_price')
      .in('agent_id', userIds)
      .eq('status', 'confirmed');

    if (error) throw error;

    const destinationStats = data.reduce((acc, booking) => {
      const destination = booking.hotel_name || 'Unknown';
      if (!acc[destination]) {
        acc[destination] = { bookings: 0, revenue: 0 };
      }
      acc[destination].bookings += 1;
      acc[destination].revenue += booking.total_price || 0;
      return acc;
    }, {} as Record<string, { bookings: number; revenue: number }>);

    return Object.entries(destinationStats)
      .map(([destination, stats]) => ({
        destination,
        bookings: stats.bookings,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  },

  async getMonthlyTrends(userIds: string[]) {
    const months = [];
    const currentDate = new Date();
    
    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        date,
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        bookings: 0,
        revenue: 0,
        quotes: 0,
        inquiries: 0
      });
    }

    // Fetch data for each table
    const [bookingsData, quotesData, inquiriesData] = await Promise.all([
      supabase.from('bookings').select('created_at, total_price').in('agent_id', userIds),
      supabase.from('quotes').select('created_at').in('created_by', userIds),
      supabase.from('inquiries').select('created_at').in('created_by', userIds)
    ]);

    // Process bookings
    if (bookingsData.data) {
      bookingsData.data.forEach(booking => {
        const date = new Date(booking.created_at);
        const monthIndex = months.findIndex(m => 
          m.date.getMonth() === date.getMonth() && 
          m.date.getFullYear() === date.getFullYear()
        );
        if (monthIndex >= 0) {
          months[monthIndex].bookings += 1;
          months[monthIndex].revenue += booking.total_price || 0;
        }
      });
    }

    // Process quotes
    if (quotesData.data) {
      quotesData.data.forEach(quote => {
        const date = new Date(quote.created_at);
        const monthIndex = months.findIndex(m => 
          m.date.getMonth() === date.getMonth() && 
          m.date.getFullYear() === date.getFullYear()
        );
        if (monthIndex >= 0) {
          months[monthIndex].quotes += 1;
        }
      });
    }

    // Process inquiries
    if (inquiriesData.data) {
      inquiriesData.data.forEach(inquiry => {
        const date = new Date(inquiry.created_at);
        const monthIndex = months.findIndex(m => 
          m.date.getMonth() === date.getMonth() && 
          m.date.getFullYear() === date.getFullYear()
        );
        if (monthIndex >= 0) {
          months[monthIndex].inquiries += 1;
        }
      });
    }

    return months.map(m => ({
      month: m.month,
      bookings: m.bookings,
      revenue: m.revenue,
      quotes: m.quotes,
      inquiries: m.inquiries
    }));
  },

  getEmptyAnalyticsData(): AnalyticsData {
    return {
      revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
      bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0 },
      quotes: { total: 0, sent: 0, approved: 0, conversionRate: 0 },
      inquiries: { total: 0, new: 0, inProgress: 0, converted: 0 },
      topDestinations: [],
      monthlyTrends: []
    };
  }
};
