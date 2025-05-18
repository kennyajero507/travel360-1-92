
import { supabase } from "../integrations/supabase/client";
import { Booking, BookingStatus, TravelVoucher } from "../types/booking.types";
import { getQuoteById, updateQuoteStatus } from "./quoteService";

// Helper for JSON parsing of complex data from Supabase
const parseBookingData = (data: any): Booking => {
  return {
    id: data.id,
    booking_reference: data.booking_reference,
    quote_id: data.quote_id,
    client: data.client,
    agent_id: data.agent_id,
    hotel_id: data.hotel_id,
    hotel_name: data.hotel_name,
    travel_start: data.travel_start,
    travel_end: data.travel_end,
    room_arrangement: Array.isArray(data.room_arrangement) 
      ? data.room_arrangement 
      : JSON.parse(data.room_arrangement || '[]'),
    transport: Array.isArray(data.transport)
      ? data.transport
      : JSON.parse(data.transport || '[]'),
    activities: Array.isArray(data.activities)
      ? data.activities
      : JSON.parse(data.activities || '[]'),
    transfers: Array.isArray(data.transfers)
      ? data.transfers
      : JSON.parse(data.transfers || '[]'),
    status: data.status as BookingStatus,
    total_price: data.total_price,
    created_at: data.created_at,
    updated_at: data.updated_at,
    notes: data.notes
  };
};

// Get all bookings
export const getAllBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
  
  return data ? data.map(parseBookingData) as Booking[] : [];
};

// Get booking by ID
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();
  
  if (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
  
  return parseBookingData(data);
};

// Get bookings by quote ID
export const getBookingsByQuoteId = async (quoteId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching bookings by quote ID:', error);
    throw error;
  }
  
  return data ? data.map(parseBookingData) as Booking[] : [];
};

// Create a booking from an approved quote
export const createBookingFromQuote = async (quoteId: string, hotelId: string): Promise<Booking | null> => {
  try {
    // 1. Get the quote data
    const quote = await getQuoteById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }
    
    // 2. Find the selected hotel
    const selectedHotel = quote.roomArrangements
      .filter(arrangement => arrangement.hotelId === hotelId)
      .map(arrangement => arrangement.hotelId)
      .pop();
    
    if (!selectedHotel && !hotelId) {
      throw new Error('Selected hotel not found in quote');
    }
    
    // 3. Filter room arrangements for the selected hotel only
    const hotelRoomArrangements = quote.roomArrangements
      .filter(arrangement => arrangement.hotelId === hotelId);
    
    if (hotelRoomArrangements.length === 0) {
      throw new Error('No room arrangements found for the selected hotel');
    }
    
    // Find the hotel name from the hotel ID
    // In a real implementation, you would fetch this from the hotels table
    const hotelName = `Hotel ${hotelId}`;
    
    // 4. Calculate the total price
    let totalPrice = 0;
    
    // Add accommodation cost
    hotelRoomArrangements.forEach(arrangement => {
      totalPrice += arrangement.total;
    });
    
    // Add transport cost
    quote.transports.forEach(transport => {
      totalPrice += transport.total;
    });
    
    // Add activities cost
    quote.activities.forEach(activity => {
      totalPrice += activity.total;
    });
    
    // Add transfers cost
    quote.transfers.forEach(transfer => {
      totalPrice += transfer.total;
    });
    
    // Apply markup
    if (quote.markup.type === "percentage") {
      totalPrice = totalPrice / (1 - (quote.markup.value / 100));
    } else {
      totalPrice += quote.markup.value;
    }
    
    // 5. Create the booking data
    const bookingData = {
      quote_id: quote.id,
      client: quote.client,
      hotel_id: hotelId,
      hotel_name: hotelName,
      travel_start: quote.startDate,
      travel_end: quote.endDate,
      room_arrangement: JSON.stringify(hotelRoomArrangements),
      transport: JSON.stringify(quote.transports),
      activities: JSON.stringify(quote.activities),
      transfers: JSON.stringify(quote.transfers),
      status: 'pending' as BookingStatus,
      total_price: totalPrice,
      notes: `Booking created from quote ${quote.id}`
    };
    
    // 6. Insert into database
    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
    
    // 7. Update quote status to approved and set the approved hotel ID
    await supabase
      .from('quotes')
      .update({
        status: 'approved',
        approved_hotel_id: hotelId,
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId);
    
    return parseBookingData(newBooking);
    
  } catch (error) {
    console.error('Error in createBookingFromQuote:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string, 
  status: BookingStatus
): Promise<boolean> => {
  const { error } = await supabase
    .from('bookings')
    .update({ 
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);
  
  if (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
  
  // If status is 'confirmed', check if we need to create a voucher
  if (status === 'confirmed') {
    const existingVoucher = await getVoucherByBookingId(bookingId);
    if (!existingVoucher) {
      await createVoucherForBooking(bookingId);
    }
  }
  
  return true;
};

// Get voucher by booking ID
export const getVoucherByBookingId = async (bookingId: string): Promise<TravelVoucher | null> => {
  const { data, error } = await supabase
    .from('travel_vouchers')
    .select('*')
    .eq('booking_id', bookingId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No data found, not an error
      return null;
    }
    console.error('Error fetching voucher by booking ID:', error);
    throw error;
  }
  
  return data as TravelVoucher;
};

// Create a travel voucher for a confirmed booking
export const createVoucherForBooking = async (bookingId: string): Promise<TravelVoucher | null> => {
  try {
    // 1. Get the booking data
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // 2. Create the voucher data
    const voucherData = {
      booking_id: bookingId,
      issued_date: new Date().toISOString(),
      notes: `Voucher for booking ${booking.booking_reference}`,
      email_sent: false
    };
    
    // 3. Insert into database
    const { data: newVoucher, error } = await supabase
      .from('travel_vouchers')
      .insert(voucherData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
    
    return newVoucher as TravelVoucher;
    
  } catch (error) {
    console.error('Error in createVoucherForBooking:', error);
    throw error;
  }
};

// Update voucher email status
export const updateVoucherEmailStatus = async (
  voucherId: string, 
  emailSent: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from('travel_vouchers')
    .update({ 
      email_sent: emailSent,
      updated_at: new Date().toISOString()
    })
    .eq('id', voucherId);
  
  if (error) {
    console.error('Error updating voucher email status:', error);
    return false;
  }
  
  return true;
};

// Get all vouchers
export const getAllVouchers = async () => {
  const { data, error } = await supabase
    .from('travel_vouchers')
    .select('*, bookings(*)') // Join with bookings table
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
  
  return data || [];
};

// Get voucher by ID
export const getVoucherById = async (voucherId: string): Promise<TravelVoucher | null> => {
  const { data, error } = await supabase
    .from('travel_vouchers')
    .select('*')
    .eq('id', voucherId)
    .single();
  
  if (error) {
    console.error('Error fetching voucher:', error);
    return null;
  }
  
  return data as TravelVoucher;
};
