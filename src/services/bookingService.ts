import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Booking, TravelVoucher, BookingStatus } from "../types/booking.types";

// Helper function to safely parse JSON data from database
const parseJsonField = (field: any) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return field || [];
};

// Helper function to convert database row to Booking interface
const mapDbRowToBooking = (row: any): Booking => {
  return {
    id: row.id,
    booking_reference: row.booking_reference,
    quote_id: row.quote_id,
    client: row.client,
    agent_id: row.agent_id,
    hotel_id: row.hotel_id,
    hotel_name: row.hotel_name,
    travel_start: row.travel_start,
    travel_end: row.travel_end,
    room_arrangement: parseJsonField(row.room_arrangement),
    transport: parseJsonField(row.transport),
    activities: parseJsonField(row.activities),
    transfers: parseJsonField(row.transfers),
    status: row.status as BookingStatus,
    payment_status: row.payment_status,
    total_price: row.total_price,
    created_at: row.created_at,
    updated_at: row.updated_at,
    notes: row.notes
  };
};

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    console.log('[BookingService] Fetching bookings from database');
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[BookingService] Error fetching bookings:', error);
      throw error;
    }

    console.log('[BookingService] Fetched bookings:', data?.length || 0);
    return (data || []).map(mapDbRowToBooking);
  } catch (error) {
    console.error('[BookingService] Error in getAllBookings:', error);
    toast.error('Failed to load bookings');
    return [];
  }
};

export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    console.log('[BookingService] Fetching booking by ID:', id);
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[BookingService] Error fetching booking:', error);
      throw error;
    }

    return data ? mapDbRowToBooking(data) : null;
  } catch (error) {
    console.error('[BookingService] Error in getBookingById:', error);
    toast.error('Failed to load booking details');
    return null;
  }
};

export const updateBookingStatus = async (id: string, status: string) => {
  try {
    console.log('[BookingService] Updating booking status:', id, status);
    
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: status as BookingStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[BookingService] Error updating booking status:', error);
      toast.error('Failed to update booking status');
      throw error;
    }

    toast.success(`Booking status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('[BookingService] Error in updateBookingStatus:', error);
    throw error;
  }
};

export const createBookingFromQuote = async (quoteId: string, hotelId: string): Promise<Booking> => {
  try {
    console.log('[BookingService] Creating booking from quote:', quoteId, hotelId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First get the quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .maybeSingle();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    // Create booking data
    const bookingData = {
      quote_id: quoteId,
      client: quote.client,
      agent_id: user.id,
      hotel_id: hotelId,
      hotel_name: 'Selected Hotel', // This should be fetched from hotels table
      travel_start: quote.start_date,
      travel_end: quote.end_date,
      room_arrangement: JSON.stringify(quote.room_arrangements),
      transport: JSON.stringify(quote.transports || []),
      activities: JSON.stringify(quote.activities || []),
      transfers: JSON.stringify(quote.transfers || []),
      status: 'pending' as BookingStatus,
      payment_status: 'pending',
      total_price: 0, // This should be calculated
      notes: quote.notes || ''
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('[BookingService] Error creating booking:', error);
      toast.error('Failed to create booking');
      throw error;
    }

    toast.success('Booking created successfully');
    return mapDbRowToBooking(data);
  } catch (error) {
    console.error('[BookingService] Error in createBookingFromQuote:', error);
    throw error;
  }
};

export const createVoucherForBooking = async (bookingId: string): Promise<TravelVoucher> => {
  try {
    console.log('[BookingService] Creating voucher for booking:', bookingId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const voucherData = {
      booking_id: bookingId,
      issued_by: user.id,
      issued_date: new Date().toISOString(),
      email_sent: false,
      notes: ''
    };

    const { data, error } = await supabase
      .from('travel_vouchers')
      .insert([voucherData])
      .select()
      .single();

    if (error) {
      console.error('[BookingService] Error creating voucher:', error);
      toast.error('Failed to create voucher');
      throw error;
    }

    toast.success('Travel voucher created successfully');
    return data;
  } catch (error) {
    console.error('[BookingService] Error in createVoucherForBooking:', error);
    throw error;
  }
};

export const getVoucherByBookingId = async (bookingId: string): Promise<TravelVoucher | null> => {
  try {
    console.log('[BookingService] Fetching voucher for booking:', bookingId);
    
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error) {
      console.error('[BookingService] Error fetching voucher:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[BookingService] Error in getVoucherByBookingId:', error);
    return null;
  }
};

export const getAllVouchers = async (): Promise<TravelVoucher[]> => {
  try {
    console.log('[BookingService] Fetching all vouchers');
    
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[BookingService] Error fetching vouchers:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[BookingService] Error in getAllVouchers:', error);
    return [];
  }
};

export const getVoucherById = async (id: string): Promise<TravelVoucher | null> => {
  try {
    console.log('[BookingService] Fetching voucher by ID:', id);
    
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[BookingService] Error fetching voucher:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[BookingService] Error in getVoucherById:', error);
    return null;
  }
};

export const updateVoucherEmailStatus = async (id: string, emailSent: boolean) => {
  try {
    console.log('[BookingService] Updating voucher email status:', id, emailSent);
    
    const { error } = await supabase
      .from('travel_vouchers')
      .update({ 
        email_sent: emailSent,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[BookingService] Error updating voucher email status:', error);
      toast.error('Failed to update voucher email status');
      throw error;
    }

    toast.success('Voucher email status updated');
    return true;
  } catch (error) {
    console.error('[BookingService] Error in updateVoucherEmailStatus:', error);
    throw error;
  }
};
