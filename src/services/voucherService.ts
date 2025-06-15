import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { TravelVoucher, Booking } from "../types/booking.types";

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

export const createVoucher = async (booking: Booking): Promise<TravelVoucher> => {
  const voucherReference = `V-${booking.booking_reference}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const newVoucher: Omit<TravelVoucher, 'id' | 'created_at' | 'updated_at'> = {
    booking_id: booking.id,
    voucher_reference: voucherReference,
    issued_date: new Date().toISOString(),
    email_sent: false,
    notes: 'Voucher generated from system.',
    voucher_pdf_url: '',
  };

  const { data, error } = await supabase
    .from('travel_vouchers')
    .insert(newVoucher)
    .select()
    .single();

  if (error) {
    console.error('Error creating voucher:', error);
    toast.error('Failed to create voucher');
    throw error;
  }
  
  return data;
};
