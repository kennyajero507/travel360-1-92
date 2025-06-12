
import { supabase } from "../integrations/supabase/client";
import { Booking, BookingStatus } from "../types/booking.types";
import { BookingFilters, BookingAnalytics, BulkActionResult, Notification, VoucherTemplate, Payment } from "../types/enhanced-booking.types";
import { convertToBooking, ensureBookingStatus } from "../utils/typeHelpers";

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

    return {
      totalBookings,
      totalRevenue,
      conversionRate,
      averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      statusBreakdown: statusCounts,
      monthlyTrends: [], // Would need more complex query for trends
      revenueBySource: [] // Would need booking source tracking
    };
  }

  async getRevenueMetrics(): Promise<any> {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*');

    if (error) throw error;

    const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;
    const totalBookings = bookings?.length || 0;
    const averageProfitMargin = 15; // Mock value - would calculate from actual data

    return {
      totalRevenue,
      totalBookings,
      averageProfitMargin,
      monthlyRevenue: [] // Would implement actual monthly data
    };
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
    // For now, just log the export request
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
    }
  }

  private convertToCSV(bookings: any[]): string {
    if (bookings.length === 0) return '';

    const headers = ['ID', 'Reference', 'Client', 'Hotel', 'Status', 'Total Price', 'Travel Start', 'Travel End'];
    const rows = bookings.map(booking => [
      booking.id,
      booking.booking_reference,
      booking.client,
      booking.hotel_name,
      booking.status,
      booking.total_price,
      booking.travel_start,
      booking.travel_end
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
    return data || [];
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
    return data;
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
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    
    return data?.map(template => ({
      ...template,
      template_content: typeof template.template_content === 'object' ? template.template_content as Record<string, any> : {}
    })) || [];
  }

  async generateVoucherPDF(voucherId: string): Promise<Blob> {
    // Placeholder - would integrate with PDF generation library
    throw new Error('PDF generation not implemented yet');
  }
}

export const enhancedBookingService = new EnhancedBookingService();
