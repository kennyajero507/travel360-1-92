import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemMetrics {
  totalOrganizations: number;
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  orgGrowth: number;
  userGrowth: number;
  subscriptionGrowth: number;
  revenueGrowth: number;
  recentOrganizations: any[];
  systemAlerts: any[];
}

export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch organizations
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*');

      if (orgError) throw orgError;

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;

      // Calculate metrics
      const totalOrganizations = organizations?.length || 0;
      const totalUsers = users?.length || 0;
      const activeSubscriptions = organizations?.filter(org => 
        org.subscription_status === 'active'
      ).length || 0;

      // Calculate monthly revenue (mock calculation)
      const tierPricing = { starter: 29, professional: 79, enterprise: 199 };
      const monthlyRevenue = organizations?.reduce((total, org) => {
        if (org.subscription_status === 'active') {
          return total + (tierPricing[org.subscription_tier as keyof typeof tierPricing] || 0);
        }
        return total;
      }, 0) || 0;

      // Mock growth percentages (in real app, compare with previous period)
      const orgGrowth = 12;
      const userGrowth = 18;
      const subscriptionGrowth = 8;
      const revenueGrowth = 15;

      // Recent organizations (last 5)
      const recentOrganizations = organizations
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        ?.slice(0, 5)
        ?.map(org => ({
          name: org.name,
          owner_email: org.owner_id, // You'd join with profiles to get actual email
          subscription_status: org.subscription_status
        })) || [];

      // Mock system alerts
      const systemAlerts = [
        {
          title: 'Database Performance',
          message: 'Query response times are within normal limits'
        },
        {
          title: 'Storage Usage',
          message: '78% of allocated storage in use'
        }
      ];

      setMetrics({
        totalOrganizations,
        totalUsers,
        activeSubscriptions,
        monthlyRevenue,
        orgGrowth,
        userGrowth,
        subscriptionGrowth,
        revenueGrowth,
        recentOrganizations,
        systemAlerts
      });

    } catch (err: any) {
      console.error('Error fetching system metrics:', err);
      setError(err.message || 'Failed to fetch system metrics');
      toast.error('Failed to load system metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};