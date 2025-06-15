
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

interface Voucher {
  id: string;
  voucher_reference: string;
  booking_id: string;
  issued_date: string;
  email_sent: boolean;
  notes?: string;
  bookings?: {
    client: string;
    hotel_name: string;
    travel_start: string;
    travel_end: string;
  };
}

export const useVoucherData = () => {
  return useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_vouchers')
        .select(`
          *,
          bookings (
            client,
            hotel_name,
            travel_start,
            travel_end
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Voucher[];
    },
  });
};
