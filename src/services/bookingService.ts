
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Booking, TravelVoucher, PaymentRecord, BookingNotification, BookingStatus, PaymentStatus } from "../types/booking.types";

// Type transformation utilities
const transformDatabaseBooking = (dbBooking: any): Booking => {
  return {
    ...dbBooking,
    room_arrangement: Array.isArray(dbBooking.room_arrangement) 
      ? dbBooking.room_arrangement 
      : (typeof dbBooking.room_arrangement === 'string' 
          ? JSON.parse(dbBooking.room_arrangement) 
          : []),
    transport: Array.isArray(dbBooking.transport) 
      ? dbBooking.transport 
      : (typeof dbBooking.transport === 'string' 
          ? JSON.parse(dbBooking.transport) 
          : []),
    activities: Array.isArray(dbBooking.activities) 
      ? dbBooking.activities 
      : (typeof dbBooking.activities === 'string' 
          ? JSON.parse(dbBooking.activities) 
          : []),
    transfers: Array.isArray(dbBooking.transfers) 
      ? dbBooking.transfers 
      : (typeof dbBooking.transfers === 'string' 
          ? JSON.parse(dbBooking.transfers) 
          : []),
    status: dbBooking.status as BookingStatus
  };
};

const transformDatabasePayment = (dbPayment: any): PaymentRecord => {
  return {
    ...dbPayment,
    payment_status: dbPayment.payment_status as PaymentStatus
  };
};

// Create or get booking from quote
export const createBookingFromQuote = async (quoteId: string, hotelId: string): Promise<Booking> => {
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

    // Create booking data - don't include booking_reference as it's auto-generated
    const bookingData = {
      client: quote.client,
      hotel_name: hotel.name,
      hotel_id: hotelId,
      travel_start: quote.start_date,
      travel_end: quote.end_date,
      room_arrangement: quote.room_arrangements || [],
      transport: quote.transports || [],
      activities: quote.activities || [],
      transfers: quote.transfers || [],
      status: 'pending' as const,
      total_price: calculateQuoteTotal(quote),
      quote_id: quoteId,
      notes: quote.notes || ''
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) throw bookingError;

    toast.success('Booking created successfully');
    return transformDatabaseBooking(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    toast.error('Failed to create booking');
    throw error;
  }
};

// Export the createBooking alias for backward compatibility
export const createBooking = createBookingFromQuote;

// Get all bookings
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(transformDatabaseBooking);
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
    
    return data ? transformDatabaseBooking(data) : null;
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
    
    return (data || []).map(transformDatabasePayment);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const recordPayment = async (payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRecord> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    
    toast.success('Payment recorded successfully');
    return transformDatabasePayment(data);
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
