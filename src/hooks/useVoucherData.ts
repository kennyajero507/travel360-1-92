import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
// FIX: import useAuth from correct location
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSync } from "./useRealtimeSync";

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
  const queryClient = useQueryClient();

  const { profile } = useAuth?.() || {};
  const orgId = profile?.org_id;

  useRealtimeSync({
    table: 'travel_vouchers',
    orgId,
    queryKeysInvalidate: ['vouchers', 'travel-vouchers'],
    queryClient,
  });

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
