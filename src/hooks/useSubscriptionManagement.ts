import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  organization_name: string;
  owner_email: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export const useSubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch organizations with owner details
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select(`
          *,
          profiles!organizations_owner_id_fkey(email)
        `);

      if (fetchError) throw fetchError;

      // Transform data to match subscription interface
      const transformedData = (data || []).map(org => ({
        id: org.id,
        organization_name: org.name,
        owner_email: (org.profiles as any)?.email || '',
        subscription_tier: org.subscription_tier || 'starter',
        subscription_status: org.subscription_status || 'trial',
        subscription_start_date: org.subscription_start_date,
        subscription_end_date: org.subscription_end_date,
        stripe_customer_id: org.stripe_customer_id,
        stripe_subscription_id: org.stripe_subscription_id
      }));

      setSubscriptions(transformedData);
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      setError(err.message || 'Failed to fetch subscriptions');
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (orgId: string, updates: {
    tier?: string;
    status?: string;
    end_date?: string;
  }) => {
    try {
      const updateData: any = {};
      
      if (updates.tier) updateData.subscription_tier = updates.tier;
      if (updates.status) updateData.subscription_status = updates.status;
      if (updates.end_date) updateData.subscription_end_date = updates.end_date;

      const { data, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      throw new Error(err.message || 'Failed to update subscription');
    }
  };

  const cancelSubscription = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ 
          subscription_status: 'cancelled',
          subscription_end_date: new Date().toISOString()
        })
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      throw new Error(err.message || 'Failed to cancel subscription');
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    updateSubscription,
    cancelSubscription,
    refetch: fetchSubscriptions
  };
};