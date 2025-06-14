
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import {
  Booking,
  RoomArrangement,
  BookingTransport,
  BookingActivity,
  BookingTransfer,
  TravelVoucher,
  PaymentRecord,
  BookingNotification,
  BookingStatus,
} from "../types/booking.types";
import { isValidBookingStatus, isValidPaymentStatus } from "../utils/typeHelpers";

// Create or get booking from quote
export const createBookingFromQuote = async (
  quoteId: string,
  hotelId: string
): Promise<Booking> => {
  try {
    // Get quote data
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError) throw quoteError;

    // Get hotel data
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotelId)
      .single();

    if (hotelError) throw hotelError;

    // Create booking data - ensure correct types
    const bookingData = {
      client: quote.client,
      hotel_name: hotel.name,
      hotel_id: hotelId,
      travel_start: quote.start_date,
      travel_end: quote.end_date,
      room_arrangement: JSON.stringify(quote.room_arrangements || []),
      transport: JSON.stringify(quote.transports || []),
      activities: JSON.stringify(quote.activities || []),
      transfers: JSON.stringify(quote.transfers || []),
      status: "pending" as BookingStatus,
      total_price: calculateQuoteTotal(quote),
      quote_id: quoteId,
      notes: quote.notes,
      booking_reference: "", // Required, will be set by DB trigger
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) throw bookingError;

    toast.success('Booking created successfully');

    // Normalize arrays and status types from DB result (parse JSON fields)
    return {
      ...booking,
      status: isValidBookingStatus(booking.status) ? booking.status : "pending",
      room_arrangement: parseJsonArray<RoomArrangement>(booking.room_arrangement),
      transport: parseJsonArray<BookingTransport>(booking.transport),
      activities: parseJsonArray<BookingActivity>(booking.activities),
      transfers: parseJsonArray<BookingTransfer>(booking.transfers),
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    toast.error('Failed to create booking');
    throw error;
  }
};

// Helper: parse "JSON" field if typeof is string
function parseJsonArray<T>(val: any): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      return Array.isArray(arr) ? arr as T[] : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Get all bookings
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Normalize each booking to match Booking type
    return (data || []).map((booking: any): Booking => ({
      ...booking,
      status: isValidBookingStatus(booking.status) ? booking.status : "pending",
      room_arrangement: parseJsonArray<RoomArrangement>(booking.room_arrangement),
      transport: parseJsonArray<BookingTransport>(booking.transport),
      activities: parseJsonArray<BookingActivity>(booking.activities),
      transfers: parseJsonArray<BookingTransfer>(booking.transfers),
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    toast.error('Failed to fetch bookings');
    return [];
  }
};

// Get booking by ID
export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      status: isValidBookingStatus(data.status) ? data.status : "pending",
      room_arrangement: parseJsonArray<RoomArrangement>(data.room_arrangement),
      transport: parseJsonArray<BookingTransport>(data.transport),
      activities: parseJsonArray<BookingActivity>(data.activities),
      transfers: parseJsonArray<BookingTransfer>(data.transfers),
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) throw error;

    toast.success(`Booking status updated to ${status}`);
  } catch (error) {
    console.error('Error updating booking status:', error);
    toast.error('Failed to update booking status');
    throw error;
  }
};

// Voucher management
export const getAllVouchers = async (): Promise<TravelVoucher[]> => {
  try {
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select(`
        *,
        bookings!inner (
          booking_reference,
          client,
          hotel_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    toast.error('Failed to fetch vouchers');
    return [];
  }
};

export const getVoucherById = async (id: string): Promise<TravelVoucher | null> => {
  try {
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching voucher:', error);
    return null;
  }
};

export const updateVoucherEmailStatus = async (voucherId: string, emailSent: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('travel_vouchers')
      .update({ email_sent: emailSent, updated_at: new Date().toISOString() })
      .eq('id', voucherId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating voucher email status:', error);
    throw error;
  }
};

// Payment management
export const getPaymentsByBooking = async (bookingId: string): Promise<PaymentRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((payment: any) => ({
      ...payment,
      payment_status: isValidPaymentStatus(payment.payment_status)
        ? payment.payment_status
        : "pending",
    }));
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const recordPayment = async (
  payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<PaymentRecord> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;

    toast.success('Payment recorded successfully');
    return {
      ...data,
      payment_status: isValidPaymentStatus(data.payment_status)
        ? data.payment_status
        : "pending",
    };
  } catch (error) {
    console.error('Error recording payment:', error);
    toast.error('Failed to record payment');
    throw error;
  }
};

// Helper function to calculate quote total
const calculateQuoteTotal = (quote: any): number => {
  const accommodationTotal = quote.room_arrangements?.reduce((sum: number, room: any) => sum + (room.total || 0), 0) || 0;
  const transportTotal = quote.transports?.reduce((sum: number, transport: any) => sum + (transport.total_cost || 0), 0) || 0;
  const transferTotal = quote.transfers?.reduce((sum: number, transfer: any) => sum + (transfer.total || 0), 0) || 0;
  const activityTotal = quote.activities?.reduce((sum: number, activity: any) => sum + (activity.total_cost || 0), 0) || 0;

  const subtotal = accommodationTotal + transportTotal + transferTotal + activityTotal;

  let markupAmount = 0;
  if (quote.markup_type === 'percentage') {
    markupAmount = (subtotal * (quote.markup_value || 0)) / 100;
  } else {
    markupAmount = quote.markup_value || 0;
  }

  return subtotal + markupAmount;
};
