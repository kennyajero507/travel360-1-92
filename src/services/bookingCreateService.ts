
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Booking, BookingStatus, RoomArrangement, BookingTransport, BookingActivity, BookingTransfer } from "../types/booking.types";
import { isValidBookingStatus } from "../utils/typeHelpers";
import { parseJsonArray, calculateQuoteTotal } from "./bookingHelpers";

// Create booking from quote
export const createBookingFromQuote = async (
  quoteId: string,
  hotelId: string
): Promise<Booking> => {
  try {
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError) throw quoteError;

    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotelId)
      .single();

    if (hotelError) throw hotelError;

    let orgId: string | null = null;
    if (quote.created_by) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', quote.created_by)
        .maybeSingle();
      if (!profileError && profile && profile.org_id) {
        orgId = profile.org_id;
      }
    }

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
      booking_reference: "",
      org_id: orgId,
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) throw bookingError;

    toast.success('Booking created successfully');

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
