
import { supabase } from "../integrations/supabase/client";

export const bookingCreateService = {
  createBooking: async (data: any) => {
    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert([data])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, booking: inserted };
  }
};
