import { supabase } from "../integrations/supabase/client";
import { Booking, BookingStatus, Payment, TravelVoucher } from "../types/booking.types";
import { BookingFilters, BookingAnalytics, BulkActionResult, Notification, VoucherTemplate } from "../types/enhanced-booking.types";
import { convertToBooking, ensureBookingStatus } from "../utils/typeHelpers";

class EnhancedBookingService {
  async getFilteredBookings(filters: BookingFilters): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select('*');

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
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

    return data?.map(booking => ({
      ...booking,
      status: ensureBookingStatus(booking.status),
      room_arrangement: Array.isArray(booking.room_arrangement) ? booking.room_arrangement : [],
      transport: Array.isArray(booking.transport) ? booking.transport : [],
      activities: Array.isArray(booking.activities) ? booking.activities : [],
      transfers: Array.isArray(booking.transfers) ? booking.transfers : []
    })) || [];
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
    }, {} as Record<BookingStatus, number>) || {} as Record<BookingStatus, number>;

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

  async exportBookings(bookingIds: string[], format: 'csv' | 'excel' | 'pdf'): Promise<Blob> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .in('id', bookingIds);

    if (error) throw error;

    // For now, return CSV format
    const csvContent = this.convertToCSV(data || []);
    return new Blob([csvContent], { type: 'text/csv' });
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

  async recordPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
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
