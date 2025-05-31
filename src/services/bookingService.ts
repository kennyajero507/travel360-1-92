
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Booking, TravelVoucher } from "../types/booking.types";

export const getAllBookings = async (): Promise<Booking[]> => {
  console.log("Fetching all bookings...");
  // Return mock booking data
  return [
    {
      id: "booking-1",
      booking_reference: "BK-2024-0001",
      quote_id: "quote-1",
      client: "John Doe",
      agent_id: "agent-1",
      hotel_id: "hotel-1",
      hotel_name: "Zanzibar Beach Resort",
      travel_start: "2024-08-20",
      travel_end: "2024-08-27",
      room_arrangement: [
        {
          id: "room-1",
          hotelId: "hotel-1",
          roomType: "Deluxe Ocean View",
          numRooms: 1,
          adults: 2,
          childrenWithBed: 1,
          childrenNoBed: 0,
          infants: 0,
          ratePerNight: {
            adult: 150,
            childWithBed: 100,
            childNoBed: 50,
            infant: 0
          },
          nights: 7,
          total: 1400
        }
      ],
      transport: [],
      activities: [],
      transfers: [],
      status: "pending",
      payment_status: "pending",
      total_price: 1610,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: ""
    }
  ];
};

export const getBookingById = async (id: string): Promise<Booking | null> => {
  console.log("Fetching booking by ID:", id);
  // Return mock booking data
  return {
    id,
    booking_reference: "BK-2024-0001",
    quote_id: "quote-1",
    client: "John Doe",
    agent_id: "agent-1",
    hotel_id: "hotel-1",
    hotel_name: "Zanzibar Beach Resort",
    travel_start: "2024-08-20",
    travel_end: "2024-08-27",
    room_arrangement: [
      {
        id: "room-1",
        hotelId: "hotel-1",
        roomType: "Deluxe Ocean View",
        numRooms: 1,
        adults: 2,
        childrenWithBed: 1,
        childrenNoBed: 0,
        infants: 0,
        ratePerNight: {
          adult: 150,
          childWithBed: 100,
          childNoBed: 50,
          infant: 0
        },
        nights: 7,
        total: 1400
      }
    ],
    transport: [],
    activities: [],
    transfers: [],
    status: "pending",
    payment_status: "pending",
    total_price: 1610,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: ""
  };
};

export const updateBookingStatus = async (id: string, status: string) => {
  console.log("Updating booking status:", id, status);
  toast.success(`Booking ${id} status updated to ${status}`);
  return true;
};

export const createBookingFromQuote = async (quoteId: string, hotelId: string): Promise<Booking> => {
  console.log("Creating booking from quote:", quoteId, hotelId);
  
  const booking: Booking = {
    id: crypto.randomUUID(),
    booking_reference: `BK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
    quote_id: quoteId,
    client: "John Doe",
    agent_id: "agent-1",
    hotel_id: hotelId,
    hotel_name: "Selected Hotel",
    travel_start: "2024-08-20",
    travel_end: "2024-08-27",
    room_arrangement: [
      {
        id: "room-1",
        hotelId: hotelId,
        roomType: "Standard Room",
        numRooms: 1,
        adults: 2,
        childrenWithBed: 0,
        childrenNoBed: 0,
        infants: 0,
        ratePerNight: {
          adult: 100,
          childWithBed: 70,
          childNoBed: 40,
          infant: 0
        },
        nights: 7,
        total: 1400
      }
    ],
    transport: [],
    activities: [],
    transfers: [],
    status: "pending",
    payment_status: "pending",
    total_price: 1610,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  toast.success("Booking created successfully");
  return booking;
};

export const createVoucherForBooking = async (bookingId: string): Promise<TravelVoucher> => {
  console.log("Creating voucher for booking:", bookingId);
  
  const voucher: TravelVoucher = {
    id: crypto.randomUUID(),
    booking_id: bookingId,
    voucher_reference: `VC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
    voucher_pdf_url: null,
    issued_date: new Date().toISOString(),
    issued_by: "system",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_sent: false
  };
  
  toast.success("Travel voucher created successfully");
  return voucher;
};

export const getVoucherByBookingId = async (bookingId: string): Promise<TravelVoucher | null> => {
  console.log("Fetching voucher for booking:", bookingId);
  // Return null for now (no voucher exists)
  return null;
};

export const getAllVouchers = async (): Promise<TravelVoucher[]> => {
  console.log("Fetching all vouchers...");
  return [];
};

export const getVoucherById = async (id: string): Promise<TravelVoucher | null> => {
  console.log("Fetching voucher by ID:", id);
  return {
    id,
    booking_id: "booking-1",
    voucher_reference: "VC-2024-0001",
    voucher_pdf_url: null,
    issued_date: new Date().toISOString(),
    issued_by: "system",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_sent: false
  };
};

export const updateVoucherEmailStatus = async (id: string, emailSent: boolean) => {
  console.log("Updating voucher email status:", id, emailSent);
  toast.success("Voucher email status updated");
  return true;
};
