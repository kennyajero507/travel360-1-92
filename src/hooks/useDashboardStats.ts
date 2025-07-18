
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

const fetchDashboardStats = async (orgId: string | null) => {
    if (!orgId) {
        return {
            activeInquiries: 0,
            pendingQuotes: 0,
            activeBookings: 0,
            revenue: 0,
        };
    }

    const { data: orgProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('org_id', orgId);

    if (profilesError) throw profilesError;
    const userIds = orgProfiles.map(p => p.id);

    if (userIds.length === 0) {
        return {
            activeInquiries: 0,
            pendingQuotes: 0,
            activeBookings: 0,
            revenue: 0,
        };
    }

    const [inquiriesRes, quotesRes, bookingsRes] = await Promise.all([
        supabase.from('inquiries').select('id', { count: 'exact' }).in('created_by', userIds).eq('status', 'New'),
        supabase.from('quotes').select('id', { count: 'exact' }).in('created_by', userIds).in('status', ['draft', 'pending']),
        supabase.from('bookings').select('total_price', { count: 'exact' }).in('agent_id', userIds).in('status', ['confirmed', 'pending'])
    ]);

    if (inquiriesRes.error) throw inquiriesRes.error;
    if (quotesRes.error) throw quotesRes.error;
    if (bookingsRes.error) throw bookingsRes.error;

    const revenue = bookingsRes.data?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;

    return {
        activeInquiries: inquiriesRes.count || 0,
        pendingQuotes: quotesRes.count || 0,
        activeBookings: bookingsRes.count || 0,
        revenue,
    };
};

export const useDashboardStats = () => {
    const { profile } = useAuth();
    const orgId = profile?.org_id || null;

    return useQuery({
        queryKey: ['dashboardStats', orgId],
        queryFn: () => fetchDashboardStats(orgId),
        enabled: !!orgId,
        placeholderData: {
            activeInquiries: 0,
            pendingQuotes: 0,
            activeBookings: 0,
            revenue: 0,
        }
    });
};
