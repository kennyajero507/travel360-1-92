
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

export interface BookingData {
  quoteId: string;
  client: string;
  agentId?: string;
  hotelId: string;
  hotelName: string;
  travelStart: string;
  travelEnd: string;
  totalPrice: number;
  status: string;
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
    return data || [];
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

    return data;
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
      status: bookingData.status,
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

export const updateBookingStatus = async (id: string, status: string) => {
  try {
    console.log('[BookingService] Updating booking status:', id, status);
    
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status,
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
