
import { supabase } from "../integrations/supabase/client";

// Get payments by booking
export const getPaymentsByBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const recordPayment = async (payment: any) => {
  const { error } = await supabase.from("payments").insert([payment]);
  if (error) throw error;
};
