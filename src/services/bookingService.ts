
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { BookingStatus } from "../types/booking.types";

export interface BookingData {
  quoteId: string;
  client: string;
  agentId?: string;
  hotelId: string;
  hotelName: string;
  travelStart: string;
  travelEnd: string;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  roomArrangement: any[];
  activities: any[];
  transport: any[];
  transfers: any[];
}

export const getAllBookings = async () => {
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
    
    // Transform the data to match our Booking interface
    const transformedData = (data || []).map(booking => ({
      ...booking,
      room_arrangement: typeof booking.room_arrangement === 'string' 
        ? JSON.parse(booking.room_arrangement) 
        : booking.room_arrangement || [],
      activities: typeof booking.activities === 'string' 
        ? JSON.parse(booking.activities) 
        : booking.activities || [],
      transport: typeof booking.transport === 'string' 
        ? JSON.parse(booking.transport) 
        : booking.transport || [],
      transfers: typeof booking.transfers === 'string' 
        ? JSON.parse(booking.transfers) 
        : booking.transfers || []
    }));
    
    return transformedData;
  } catch (error) {
    console.error('[BookingService] Error in getAllBookings:', error);
    toast.error('Failed to load bookings');
    return [];
  }
};

export const getBookingById = async (id: string) => {
  try {
    console.log('[BookingService] Fetching booking by ID:', id);
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[BookingService] Error fetching booking:', error);
      throw error;
    }

    // Transform the data
    const transformedData = {
      ...data,
      room_arrangement: typeof data.room_arrangement === 'string' 
        ? JSON.parse(data.room_arrangement) 
        : data.room_arrangement || [],
      activities: typeof data.activities === 'string' 
        ? JSON.parse(data.activities) 
        : data.activities || [],
      transport: typeof data.transport === 'string' 
        ? JSON.parse(data.transport) 
        : data.transport || [],
      transfers: typeof data.transfers === 'string' 
        ? JSON.parse(data.transfers) 
        : data.transfers || []
    };

    return transformedData;
  } catch (error) {
    console.error('[BookingService] Error in getBookingById:', error);
    toast.error('Failed to load booking details');
    return null;
  }
};

export const createBooking = async (bookingData: BookingData) => {
  try {
    console.log('[BookingService] Creating booking:', bookingData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate booking reference
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const bookingReference = `BK-${year}-${randomNum}`;

    const newBooking = {
      booking_reference: bookingReference,
      quote_id: bookingData.quoteId,
      client: bookingData.client,
      agent_id: bookingData.agentId || null,
      hotel_id: bookingData.hotelId,
      hotel_name: bookingData.hotelName,
      travel_start: bookingData.travelStart,
      travel_end: bookingData.travelEnd,
      total_price: bookingData.totalPrice,
      status: bookingData.status as BookingStatus,
      notes: bookingData.notes || null,
      room_arrangement: JSON.stringify(bookingData.roomArrangement),
      activities: JSON.stringify(bookingData.activities),
      transport: JSON.stringify(bookingData.transport),
      transfers: JSON.stringify(bookingData.transfers),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(newBooking)
      .select()
      .single();

    if (error) {
      console.error('[BookingService] Error creating booking:', error);
      throw error;
    }

    console.log('[BookingService] Booking created successfully:', data.id);
    toast.success('Booking created successfully');
    return data;
  } catch (error) {
    console.error('[BookingService] Error in createBooking:', error);
    toast.error('Failed to create booking');
    throw error;
  }
};

export const createBookingFromQuote = async (quoteId: string, hotelId: string) => {
  try {
    console.log('[BookingService] Creating booking from quote:', quoteId, hotelId);
    
    // Fetch quote data first
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    const bookingData: BookingData = {
      quoteId: quote.id,
      client: quote.client,
      agentId: quote.created_by,
      hotelId: hotelId,
      hotelName: quote.destination, // Fallback
      travelStart: quote.start_date,
      travelEnd: quote.end_date,
      totalPrice: 0, // Calculate from quote
      status: 'pending',
      roomArrangement: quote.room_arrangements || [],
      activities: quote.activities || [],
      transport: quote.transports || [],
      transfers: quote.transfers || []
    };

    return await createBooking(bookingData);
  } catch (error) {
    console.error('[BookingService] Error in createBookingFromQuote:', error);
    throw error;
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
      throw error;
    }

    toast.success(`Booking status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('[BookingService] Error in updateBookingStatus:', error);
    toast.error('Failed to update booking status');
    throw error;
  }
};

export const deleteBooking = async (id: string) => {
  try {
    console.log('[BookingService] Deleting booking:', id);
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[BookingService] Error deleting booking:', error);
      throw error;
    }

    toast.success('Booking deleted successfully');
    return true;
  } catch (error) {
    console.error('[BookingService] Error in deleteBooking:', error);
    toast.error('Failed to delete booking');
    throw error;
  }
};

// Voucher-related functions
export const getAllVouchers = async () => {
  try {
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    toast.error('Failed to load vouchers');
    return [];
  }
};

export const getVoucherById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching voucher:', error);
    toast.error('Failed to load voucher');
    return null;
  }
};

export const updateVoucherEmailStatus = async (id: string, emailSent: boolean) => {
  try {
    const { error } = await supabase
      .from('travel_vouchers')
      .update({ email_sent: emailSent })
      .eq('id', id);

    if (error) throw error;
    toast.success('Voucher email status updated');
    return true;
  } catch (error) {
    console.error('Error updating voucher email status:', error);
    toast.error('Failed to update voucher email status');
    return false;
  }
};
