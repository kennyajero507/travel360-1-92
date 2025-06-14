
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { BookingStatus } from "../types/booking.types";

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
