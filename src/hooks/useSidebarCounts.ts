
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface SidebarCounts {
  inquiries: number;
  quotes: number;
  bookings: number;
  vouchers: number;
  clients: number;
}

const fetchSidebarCounts = async (orgId: string | null): Promise<SidebarCounts> => {
  if (!orgId) {
    return {
      inquiries: 0,
      quotes: 0,
      bookings: 0,
      vouchers: 0,
      clients: 0,
    };
  }

  // Get all users in the organization
  const { data: orgProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('org_id', orgId);

  const userIds = orgProfiles?.map(p => p.id) || [];

  if (userIds.length === 0) {
    return {
      inquiries: 0,
      quotes: 0,
      bookings: 0,
      vouchers: 0,
      clients: 0,
    };
  }

  // Fetch counts in parallel
  const [inquiriesRes, quotesRes, bookingsRes, vouchersRes, clientsRes] = await Promise.all([
    supabase
      .from('inquiries')
      .select('id', { count: 'exact' })
      .in('created_by', userIds),
    supabase
      .from('quotes')
      .select('id', { count: 'exact' })
      .in('created_by', userIds),
    supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .in('agent_id', userIds),
    // Fix voucher query: get vouchers for bookings created by org users
    supabase
      .from('travel_vouchers')
      .select(`
        id,
        bookings!inner(agent_id)
      `, { count: 'exact' })
      .in('bookings.agent_id', userIds),
    supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .in('created_by', userIds)
  ]);

  return {
    inquiries: inquiriesRes.count || 0,
    quotes: quotesRes.count || 0,
    bookings: bookingsRes.count || 0,
    vouchers: vouchersRes.count || 0,
    clients: clientsRes.count || 0,
  };
};

export const useSidebarCounts = () => {
  const { organization } = useAuth();
  const orgId = organization?.id || null;

  return useQuery({
    queryKey: ['sidebarCounts', orgId],
    queryFn: () => fetchSidebarCounts(orgId),
    enabled: !!orgId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    placeholderData: {
      inquiries: 0,
      quotes: 0,
      bookings: 0,
      vouchers: 0,
      clients: 0,
    }
  });
};
