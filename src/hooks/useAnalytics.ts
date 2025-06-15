
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

const fetchAnalyticsData = async (orgId: string | null) => {
    if (!orgId) {
        return {
            quoteCount: 0,
            bookingCount: 0,
            invoiceCount: 0,
            bookingRevenue: 0,
            invoiceRevenue: 0,
        };
    }

    const { data: orgProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('org_id', orgId);

    if (profilesError) {
        console.error('Error fetching profiles for org:', profilesError);
        throw profilesError;
    }

    const userIds = orgProfiles.map(p => p.id);

    if (userIds.length === 0) {
        return {
            quoteCount: 0,
            bookingCount: 0,
            invoiceCount: 0,
            bookingRevenue: 0,
            invoiceRevenue: 0,
        };
    }

    const [quotesRes, bookingsRes, invoicesRes] = await Promise.all([
        supabase.from('quotes').select('id', { count: 'exact' }).in('created_by', userIds),
        supabase.from('bookings').select('total_price', { count: 'exact' }).in('agent_id', userIds),
        supabase.from('invoices').select('amount', { count: 'exact' }).in('created_by', userIds),
    ]);

    if (quotesRes.error) throw quotesRes.error;
    if (bookingsRes.error) throw bookingsRes.error;
    if (invoicesRes.error) throw invoicesRes.error;
    
    const bookingRevenue = bookingsRes.data?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;
    const invoiceRevenue = invoicesRes.data?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;

    return {
        quoteCount: quotesRes.count || 0,
        bookingCount: bookingsRes.count || 0,
        invoiceCount: invoicesRes.count || 0,
        bookingRevenue,
        invoiceRevenue,
    };
};

export const useAnalytics = () => {
    const { organization } = useAuth();
    const orgId = organization?.id || null;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['analyticsSummary', orgId],
        queryFn: () => fetchAnalyticsData(orgId),
        enabled: !!orgId,
    });

  return {
    quoteCount: data?.quoteCount ?? 0,
    bookingCount: data?.bookingCount ?? 0,
    invoiceCount: data?.invoiceCount ?? 0,
    bookingRevenue: data?.bookingRevenue ?? 0,
    invoiceRevenue: data?.invoiceRevenue ?? 0,
    topHotels: [],
    topClients: [],
    mostRecentInvoice: null,
    isLoading,
    isError,
  };
};
