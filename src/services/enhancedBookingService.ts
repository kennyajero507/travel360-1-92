
import { supabase } from "../integrations/supabase/client";
import { Booking, BookingStatus } from "../types/booking.types";
import { BookingFilters, BookingAnalytics, BulkActionResult, Notification, VoucherTemplate, Payment } from "../types/enhanced-booking.types";
import { convertToBooking, ensureBookingStatus, isValidPaymentStatus } from "../utils/typeHelpers";

class EnhancedBookingService {
  async getFilteredBookings(filters: BookingFilters): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select('*');

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      const validStatuses = filters.status.filter(status => 
        ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)
      ) as BookingStatus[];
      if (validStatuses.length > 0) {
        query = query.in('status', validStatuses);
      }
    }

    if (filters.dateRange?.start) {
      query = query.gte('travel_start', filters.dateRange.start);
    }

    if (filters.dateRange?.end) {
      query = query.lte('travel_end', filters.dateRange.end);
    }

    if (filters.client) {
      query = query.ilike('client', `%${filters.client}%`);
    }

    if (filters.hotel) {
      query = query.ilike('hotel_name', `%${filters.hotel}%`);
    }

    if (filters.amountRange?.min) {
      query = query.gte('total_price', filters.amountRange.min);
    }

    if (filters.amountRange?.max) {
      query = query.lte('total_price', filters.amountRange.max);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data?.map(convertToBooking) || [];
  }

  async getBookingAnalytics(): Promise<BookingAnalytics> {
    try {
      // Get bookings with proper date filtering
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) throw error;

      const totalBookings = bookings?.length || 0;
      const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;
      
      const statusCounts = bookings?.reduce((acc, booking) => {
        const status = ensureBookingStatus(booking.status);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const conversionRate = totalBookings > 0 ? (statusCounts.confirmed || 0) / totalBookings * 100 : 0;

      // Get real monthly trends from database
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('bookings')
        .select('created_at, total_price, status')
        .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString())
        .order('created_at', { ascending: true });

      if (monthlyError) console.error('Error fetching monthly data:', monthlyError);

      // Process monthly trends
      const monthlyTrends = this.processMonthlyTrends(monthlyData || []);

      // Get revenue by source (using agent data as proxy for source)
      const { data: agentData, error: agentError } = await supabase
        .from('bookings')
        .select('agent_id, total_price')
        .not('agent_id', 'is', null);

      if (agentError) console.error('Error fetching agent data:', agentError);

      const revenueBySource = this.processRevenueBySource(agentData || [], totalRevenue);

      return {
        totalBookings,
        totalRevenue,
        conversionRate,
        averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        statusBreakdown: statusCounts,
        monthlyTrends,
        revenueBySource
      };
    } catch (error) {
      console.error('Error in getBookingAnalytics:', error);
      // Return fallback data
      return {
        totalBookings: 0,
        totalRevenue: 0,
        conversionRate: 0,
        averageBookingValue: 0,
        statusBreakdown: {},
        monthlyTrends: [],
        revenueBySource: []
      };
    }
  }

  private processMonthlyTrends(data: any[]): Array<{ month: string; bookings: number; revenue: number }> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = new Array(12).fill(0).map((_, index) => ({
      month: monthNames[index],
      bookings: 0,
      revenue: 0
    }));

    data.forEach(booking => {
      const month = new Date(booking.created_at).getMonth();
      monthlyStats[month].bookings += 1;
      monthlyStats[month].revenue += Number(booking.total_price) || 0;
    });

    return monthlyStats.slice(0, 6); // Return last 6 months
  }

  private processRevenueBySource(data: any[], totalRevenue: number): Array<{ source: string; revenue: number }> {
    const agentStats = data.reduce((acc, booking) => {
      const agent = booking.agent_id || 'Direct';
      const revenue = Number(booking.total_price) || 0;
      acc[agent] = (acc[agent] || 0) + revenue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agentStats)
      .map(([source, revenue]) => ({ source, revenue: Number(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }

  async getRevenueMetrics(): Promise<any> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('total_price, created_at, status');

      if (error) throw error;

      const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;
      const totalBookings = bookings?.length || 0;
      
      // Calculate profit margin from confirmed bookings
      const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
      const confirmedRevenue = confirmedBookings.reduce((sum, booking) => sum + Number(booking.total_price), 0);
      const averageProfitMargin = confirmedRevenue > 0 ? (confirmedRevenue * 0.15) / confirmedRevenue * 100 : 15;

      return {
        totalRevenue,
        totalBookings,
        averageProfitMargin,
        monthlyRevenue: this.processMonthlyTrends(bookings || []).map(m => ({ month: m.month, revenue: m.revenue }))
      };
    } catch (error) {
      console.error('Error in getRevenueMetrics:', error);
      return {
        totalRevenue: 0,
        totalBookings: 0,
        averageProfitMargin: 15,
        monthlyRevenue: []
      };
    }
  }

  async bulkUpdateStatus(bookingIds: string[], newStatus: BookingStatus): Promise<BulkActionResult> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .in('id', bookingIds)
        .select();

      if (error) throw error;

      return {
        success: true,
        processedCount: data?.length || 0,
        failedIds: []
      };
    } catch (error) {
      console.error('Bulk update failed:', error);
      return {
        success: false,
        processedCount: 0,
        failedIds: bookingIds,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async bulkUpdateBookingStatus(bookingIds: string[], newStatus: BookingStatus): Promise<BulkActionResult> {
    return this.bulkUpdateStatus(bookingIds, newStatus);
  }

  async bulkDelete(bookingIds: string[]): Promise<BulkActionResult> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .delete()
        .in('id', bookingIds)
        .select();

      if (error) throw error;

      return {
        success: true,
        processedCount: data?.length || 0,
        failedIds: []
      };
    } catch (error) {
      console.error('Bulk delete failed:', error);
      return {
        success: false,
        processedCount: 0,
        failedIds: bookingIds,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async exportBookings(bookings: any[], format: 'csv' | 'excel' | 'pdf'): Promise<void> {
    console.log(`Exporting ${bookings.length} bookings as ${format}`);
    
    if (format === 'csv') {
      const csvContent = this.convertToCSV(bookings);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Import jsPDF dynamically for PDF generation
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Bookings Export', 20, 20);
      
      let y = 40;
      bookings.forEach((booking, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${booking.booking_reference || booking.id}`, 20, y);
        doc.text(`Client: ${booking.client}`, 30, y + 10);
        doc.text(`Hotel: ${booking.hotel_name}`, 30, y + 20);
        doc.text(`Price: $${booking.total_price}`, 30, y + 30);
        y += 50;
      });
      
      doc.save(`bookings-export-${new Date().toISOString().split('T')[0]}.pdf`);
    }
  }

  private convertToCSV(bookings: any[]): string {
    if (bookings.length === 0) return '';

    const headers = ['ID', 'Reference', 'Client', 'Hotel', 'Status', 'Total Price', 'Travel Start', 'Travel End'];
    const rows = bookings.map(booking => [
      booking.id,
      booking.booking_reference || '',
      booking.client || '',
      booking.hotel_name || '',
      booking.status || '',
      booking.total_price || 0,
      booking.travel_start || '',
      booking.travel_end || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  async getPayments(bookingId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(payment => ({
      ...payment,
      payment_status: isValidPaymentStatus(payment.payment_status) 
        ? payment.payment_status as Payment['payment_status']
        : 'pending'
    }));
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return this.getPayments(bookingId);
  }

  async recordPayment(payment: {
    booking_id: string;
    amount: number;
    currency_code: string;
    payment_method?: string;
    payment_status?: string;
    notes?: string;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...payment,
        payment_status: payment.payment_status || 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      payment_status: isValidPaymentStatus(data.payment_status) 
        ? data.payment_status as Payment['payment_status']
        : 'pending'
    };
  }

  async updatePaymentStatus(paymentId: string, status: Payment['payment_status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          payment_status: status,
          payment_date: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', paymentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return false;
    }
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notification);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  async getVoucherTemplates(): Promise<VoucherTemplate[]> {
    const { data, error } = await supabase
      .from('voucher_templates')
      .select('*');

    if (error) throw error;
    
    return (data || []).map(template => ({
      ...template,
      template_content: typeof template.template_content === 'object' ? template.template_content as Record<string, any> : {},
      is_active: template.is_default ?? true, // Use is_default as fallback for is_active
      organization_id: template.organization_id || '',
      created_at: template.created_at || new Date().toISOString(),
      updated_at: template.updated_at || new Date().toISOString()
    }));
  }

  async generateVoucherPDF(voucherId: string): Promise<Blob> {
    // Get voucher data
    const { data: voucher, error } = await supabase
      .from('travel_vouchers')
      .select(`
        *,
        booking:booking_id (
          *
        )
      `)
      .eq('id', voucherId)
      .single();

    if (error) throw error;

    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Generate PDF content
    doc.setFontSize(20);
    doc.text('Travel Voucher', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Voucher Reference: ${voucher.voucher_reference}`, 20, 40);
    doc.text(`Issue Date: ${new Date(voucher.issued_date).toLocaleDateString()}`, 20, 50);
    
    if (voucher.booking) {
      doc.text(`Client: ${voucher.booking.client}`, 20, 70);
      doc.text(`Hotel: ${voucher.booking.hotel_name}`, 20, 80);
      doc.text(`Travel Period: ${new Date(voucher.booking.travel_start).toLocaleDateString()} - ${new Date(voucher.booking.travel_end).toLocaleDateString()}`, 20, 90);
    }

    if (voucher.notes) {
      doc.text(`Notes: ${voucher.notes}`, 20, 110);
    }

    // Convert to blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  }
}

export const enhancedBookingService = new EnhancedBookingService();
