
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Booking } from "../types/booking.types";

export const createBookingFromQuote = async (quoteId: string, hotelId: string): Promise<Booking | null> => {
  try {
    // This is a mock implementation
    // In real implementation, this would create a booking in the database
    const mockBooking: Booking = {
      id: crypto.randomUUID(),
      booking_reference: `BK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      quote_id: quoteId,
      client: "John Doe",
      hotel_id: hotelId,
      hotel_name: "Sample Hotel",
      travel_start: "2024-08-20",
      travel_end: "2024-08-27",
      room_arrangement: [],
      transport: [],
      activities: [],
      transfers: [],
      status: "confirmed",
      total_price: 3500,
      created_at: new Date().toISOString()
    };

    console.log("Creating booking from quote:", quoteId);
    toast.success(`Booking created successfully! Reference: ${mockBooking.booking_reference}`);
    
    return mockBooking;
  } catch (error) {
    console.error("Error creating booking:", error);
    toast.error("Failed to create booking");
    return null;
  }
};
