
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { TravelVoucher } from "../types/booking.types";

// Voucher management
export const getAllVouchers = async (): Promise<TravelVoucher[]> => {
  try {
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select(`
        *,
        bookings!inner (
          booking_reference,
          client,
          hotel_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    toast.error('Failed to fetch vouchers');
    return [];
  }
};

export const getVoucherById = async (id: string): Promise<TravelVoucher | null> => {
  try {
    const { data, error } = await supabase
      .from('travel_vouchers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching voucher:', error);
    return null;
  }
};

export const updateVoucherEmailStatus = async (voucherId: string, emailSent: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('travel_vouchers')
      .update({ email_sent: emailSent, updated_at: new Date().toISOString() })
      .eq('id', voucherId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating voucher email status:', error);
    throw error;
  }
};
