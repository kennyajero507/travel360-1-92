import { supabase } from "../integrations/supabase/client";
import { Booking } from "../types/booking.types";
import { Invoice, InvoiceLineItem } from "../types/invoice.types";

// EnhancedBookingService with actual DB implementations
class EnhancedBookingService {
  async getFilteredBookings(filters = {}) {
    // Basic example: add more filters as needed
    let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    // Example simple filters
    // if (filters.status) query = query.eq("status", filters.status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async bulkUpdateStatus(ids: string[], status: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .in("id", ids);

    return {
      success: !error,
      processedCount: error ? 0 : ids.length,
      failedIds: error ? ids : [],
      error: error ? error.message : null,
    };
  }

  async bulkDelete(ids: string[]) {
    const { error } = await supabase.from("bookings").delete().in("id", ids);
    return {
      success: !error,
      processedCount: error ? 0 : ids.length,
      failedIds: error ? ids : [],
      error: error ? error.message : null,
    };
  }

  async exportBookings() {
    // Implement export as needed
    throw new Error("Not yet implemented.");
  }

  async getInvoiceByBookingId(bookingId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();
    
    if (error) throw error;
    return data as Invoice | null;
  }

  async createInvoiceFromBooking(booking: Booking): Promise<Invoice> {
    const invoiceNumber = `INV-${booking.booking_reference}-${Date.now().toString().slice(-4)}`;
    
    const lineItems: Omit<InvoiceLineItem, 'id'>[] = [
      {
        description: `Travel package for ${booking.hotel_name}`,
        quantity: 1,
        unit_price: booking.total_price,
        total: booking.total_price,
      }
    ];

    const newInvoiceData = {
      booking_id: booking.id,
      invoice_number: `INV-${booking.booking_reference}-${Date.now().toString().slice(-4)}`,
      client_name: booking.client,
      amount: booking.total_price,
      currency_code: 'USD',
      status: 'draft',
      line_items: lineItems.map(item => ({...item, id: Math.random().toString()})),
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    };
    
    const { data, error } = await supabase
      .from('invoices')
      .insert(newInvoiceData)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Invoice;
  }

  async getPaymentsByBooking(bookingId: string) {
    // Fetch payments for a booking
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId);
    if (error) throw error;
    return data || [];
  }

  async recordPayment(payment: any) {
    const { error } = await supabase.from("payments").insert([payment]);
    if (error) throw error;
  }

  async updatePaymentStatus(paymentId: string, status: string) {
    const { error } = await supabase
      .from("payments")
      .update({ payment_status: status })
      .eq("id", paymentId);
    if (error) throw error;
    return true;
  }

  // ... stub for getBookingAnalytics, getRevenueMetrics etc as before (not error-raising)
  async getBookingAnalytics() { return { totalBookings: 0, totalRevenue: 0 }; }
  async getRevenueMetrics() { return { totalRevenue: 0, totalBookings: 0 }; }
  async sendNotification() { return false; }
  async getVoucherTemplates() { return []; }
  async generateVoucherPDF() { throw new Error("Not yet implemented."); }
}
export const enhancedBookingService = new EnhancedBookingService();
