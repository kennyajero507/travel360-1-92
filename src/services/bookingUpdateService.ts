
import { supabase } from "../integrations/supabase/client";

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId);
  if (error) throw error;
};
