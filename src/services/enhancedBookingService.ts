
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Payment, BookingAnalytics, EmailTemplate, Notification, VoucherTemplate, BookingFilters } from "../types/enhanced-booking.types";
import { Booking } from "../types/booking.types";
import { convertToPayment, convertToEmailTemplate, convertToBooking, isValidBookingStatus } from "../utils/typeHelpers";

export const enhancedBookingService = {
  // Payment Management
  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertToPayment);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment information');
      return [];
    }
  },

  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();

      if (error) throw error;
      toast.success('Payment record created successfully');
      return convertToPayment(data);
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment record');
      return null;
    }
  },

  async updatePaymentStatus(paymentId: string, status: Payment['payment_status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          payment_status: status,
          payment_date: status === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;
      toast.success(`Payment status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
      return false;
    }
  },

  // Analytics
  async getBookingAnalytics(organizationId?: string): Promise<BookingAnalytics[]> {
    try {
      let query = supabase
        .from('booking_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      toast.error('Failed to load analytics data');
      return [];
    }
  },

  async getRevenueMetrics(organizationId?: string) {
    try {
      let query = supabase
        .from('booking_analytics')
        .select('revenue, profit_margin, created_at');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const totalRevenue = data?.reduce((sum, item) => sum + item.revenue, 0) || 0;
      const averageProfitMargin = data?.length 
        ? data.reduce((sum, item) => sum + (item.profit_margin || 0), 0) / data.length 
        : 0;

      return {
        totalRevenue,
        averageProfitMargin,
        totalBookings: data?.length || 0,
        monthlyRevenue: this.getMonthlyRevenue(data || [])
      };
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      return { totalRevenue: 0, averageProfitMargin: 0, totalBookings: 0, monthlyRevenue: [] };
    }
  },

  getMonthlyRevenue(data: any[]) {
    const monthlyData: Record<string, number> = {};
    
    data.forEach(item => {
      const month = new Date(item.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + item.revenue;
    });

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }));
  },

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []).map(convertToEmailTemplate);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast.error('Failed to load email templates');
      return [];
    }
  },

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      toast.success('Email template created successfully');
      return convertToEmailTemplate(data);
    } catch (error) {
      console.error('Error creating email template:', error);
      toast.error('Failed to create email template');
      return null;
    }
  },

  // Notifications
  async sendNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification]);

      if (error) throw error;
      toast.success('Notification sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
      return false;
    }
  },

  // Bulk Operations
  async bulkUpdateBookingStatus(bookingIds: string[], status: string): Promise<boolean> {
    try {
      if (!isValidBookingStatus(status)) {
        throw new Error('Invalid booking status');
      }

      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', bookingIds);

      if (error) throw error;
      toast.success(`Updated ${bookingIds.length} bookings to ${status}`);
      return true;
    } catch (error) {
      console.error('Error bulk updating bookings:', error);
      toast.error('Failed to update bookings');
      return false;
    }
  },

  // Advanced Filtering
  async getFilteredBookings(filters: BookingFilters): Promise<Booking[]> {
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status?.length) {
        const validStatuses = filters.status.filter(isValidBookingStatus);
        query = query.in('status', validStatuses);
      }

      if (filters.dateRange) {
        query = query
          .gte('travel_start', filters.dateRange.start)
          .lte('travel_end', filters.dateRange.end);
      }

      if (filters.client) {
        query = query.ilike('client', `%${filters.client}%`);
      }

      if (filters.hotel) {
        query = query.ilike('hotel_name', `%${filters.hotel}%`);
      }

      if (filters.amountRange) {
        query = query
          .gte('total_price', filters.amountRange.min)
          .lte('total_price', filters.amountRange.max);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(convertToBooking);
    } catch (error) {
      console.error('Error filtering bookings:', error);
      toast.error('Failed to filter bookings');
      return [];
    }
  },

  // Export functionality
  async exportBookings(bookings: any[], format: 'csv' | 'excel' | 'pdf'): Promise<string> {
    try {
      if (format === 'csv') {
        return this.exportToCSV(bookings);
      } else if (format === 'excel') {
        return this.exportToExcel(bookings);
      } else {
        return this.exportToPDF(bookings);
      }
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast.error('Failed to export bookings');
      return '';
    }
  },

  exportToCSV(bookings: Booking[]): string {
    const headers = ['Booking Reference', 'Client', 'Hotel', 'Travel Start', 'Travel End', 'Status', 'Total Price'];
    const csvContent = [
      headers.join(','),
      ...bookings.map(booking => [
        booking.booking_reference,
        booking.client,
        booking.hotel_name,
        booking.travel_start,
        booking.travel_end,
        booking.status,
        booking.total_price
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    return 'CSV export completed';
  },

  exportToExcel(bookings: Booking[]): string {
    // Simplified Excel export - uses CSV format for now
    return this.exportToCSV(bookings);
  },

  exportToPDF(bookings: Booking[]): string {
    // Simplified PDF export - placeholder
    toast.info('PDF export feature coming soon');
    return 'PDF export feature coming soon';
  },

  // Voucher Management
  async getVoucherTemplates(): Promise<VoucherTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('voucher_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching voucher templates:', error);
      toast.error('Failed to load voucher templates');
      return [];
    }
  }
};
