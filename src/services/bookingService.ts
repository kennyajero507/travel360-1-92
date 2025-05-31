
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

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    console.log("Fetching all bookings...");
    // Mock bookings data
    return [
      {
        id: crypto.randomUUID(),
        booking_reference: "BK-2024-001",
        quote_id: "quote-1",
        client: "John Doe",
        hotel_id: "hotel-1",
        hotel_name: "Zanzibar Beach Resort",
        travel_start: "2024-08-20",
        travel_end: "2024-08-27",
        room_arrangement: [],
        transport: [],
        activities: [],
        transfers: [],
        status: "confirmed",
        total_price: 3500,
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    toast.error("Failed to load bookings");
    return [];
  }
};

export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    console.log("Fetching booking by ID:", id);
    // Mock booking data
    return {
      id,
      booking_reference: "BK-2024-001",
      quote_id: "quote-1",
      client: "John Doe",
      hotel_id: "hotel-1",
      hotel_name: "Zanzibar Beach Resort",
      travel_start: "2024-08-20",
      travel_end: "2024-08-27",
      room_arrangement: [],
      transport: [],
      activities: [],
      transfers: [],
      status: "confirmed",
      total_price: 3500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching booking:", error);
    toast.error("Failed to load booking");
    return null;
  }
};

export const updateBookingStatus = async (id: string, status: string): Promise<boolean> => {
  try {
    console.log("Updating booking status:", id, status);
    toast.success(`Booking status updated to ${status}`);
    return true;
  } catch (error) {
    console.error("Error updating booking status:", error);
    toast.error("Failed to update booking status");
    return false;
  }
};

export const createVoucherForBooking = async (bookingId: string) => {
  try {
    console.log("Creating voucher for booking:", bookingId);
    const mockVoucher = {
      id: crypto.randomUUID(),
      voucher_reference: `VC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      booking_id: bookingId,
      issued_date: new Date().toISOString(),
      email_sent: false
    };
    toast.success("Travel voucher created successfully");
    return mockVoucher;
  } catch (error) {
    console.error("Error creating voucher:", error);
    toast.error("Failed to create voucher");
    return null;
  }
};

export const getVoucherByBookingId = async (bookingId: string) => {
  try {
    console.log("Fetching voucher for booking:", bookingId);
    // Mock voucher data - return null if no voucher exists
    return {
      id: crypto.randomUUID(),
      voucher_reference: "VC-2024-001",
      booking_id: bookingId,
      issued_date: new Date().toISOString(),
      email_sent: false
    };
  } catch (error) {
    console.error("Error fetching voucher:", error);
    return null;
  }
};

export const getAllVouchers = async () => {
  try {
    console.log("Fetching all vouchers...");
    return [
      {
        id: crypto.randomUUID(),
        voucher_reference: "VC-2024-001",
        booking_id: "booking-1",
        issued_date: new Date().toISOString(),
        email_sent: false,
        bookings: {
          booking_reference: "BK-2024-001",
          client: "John Doe",
          hotel_name: "Zanzibar Beach Resort"
        }
      }
    ];
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    toast.error("Failed to load vouchers");
    return [];
  }
};

export const getVoucherById = async (id: string) => {
  try {
    console.log("Fetching voucher by ID:", id);
    return {
      id,
      voucher_reference: "VC-2024-001",
      booking_id: "booking-1",
      issued_date: new Date().toISOString(),
      email_sent: false,
      bookings: {
        booking_reference: "BK-2024-001",
        client: "John Doe",
        hotel_name: "Zanzibar Beach Resort"
      }
    };
  } catch (error) {
    console.error("Error fetching voucher:", error);
    return null;
  }
};

export const updateVoucherEmailStatus = async (id: string, emailSent: boolean): Promise<boolean> => {
  try {
    console.log("Updating voucher email status:", id, emailSent);
    toast.success("Voucher email status updated");
    return true;
  } catch (error) {
    console.error("Error updating voucher email status:", error);
    toast.error("Failed to update email status");
    return false;
  }
};
