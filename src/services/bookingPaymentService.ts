
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { PaymentRecord } from "../types/booking.types";
import { isValidPaymentStatus } from "../utils/typeHelpers";

// Get payments by booking
export const getPaymentsByBooking = async (bookingId: string): Promise<PaymentRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((payment: any) => ({
      ...payment,
      payment_status: isValidPaymentStatus(payment.payment_status)
        ? payment.payment_status
        : "pending",
    }));
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const recordPayment = async (
  payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<PaymentRecord> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;

    toast.success('Payment recorded successfully');
    return {
      ...data,
      payment_status: isValidPaymentStatus(data.payment_status)
        ? data.payment_status
        : "pending",
    };
  } catch (error) {
    console.error('Error recording payment:', error);
    toast.error('Failed to record payment');
    throw error;
  }
};
