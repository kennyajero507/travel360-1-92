
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import {
  Booking,
  RoomArrangement,
  BookingTransport,
  BookingActivity,
  BookingTransfer,
} from "../types/booking.types";
import { isValidBookingStatus } from "../utils/typeHelpers";
import { parseJsonArray } from "./bookingHelpers";

// Get all bookings
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((booking: any): Booking => ({
      ...booking,
      status: isValidBookingStatus(booking.status) ? booking.status : "pending",
      room_arrangement: parseJsonArray<RoomArrangement>(booking.room_arrangement),
      transport: parseJsonArray<BookingTransport>(booking.transport),
      activities: parseJsonArray<BookingActivity>(booking.activities),
      transfers: parseJsonArray<BookingTransfer>(booking.transfers),
    }));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    toast.error("Failed to fetch bookings");
    return [];
  }
};

// Get booking by ID
export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
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
    console.error("Error fetching booking:", error);
    return null;
  }
};
