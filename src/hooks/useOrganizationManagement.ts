import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  owner_id: string;
  owner_email: string;
  status: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
  user_count: number;
}

interface CreateOrganizationData {
  name: string;
  owner_email: string;
  subscription_tier: string;
  subscription_status: string;
}

export const useOrganizationManagement = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch organizations with user count
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select(`
          *,
          profiles!profiles_org_id_fkey(count)
        `);

      if (fetchError) throw fetchError;

      // Transform data to include user count and owner email
      const transformedData = await Promise.all(
        (data || []).map(async (org) => {
          // Get owner email
          let ownerEmail = '';
          if (org.owner_id) {
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', org.owner_id)
              .single();
            ownerEmail = ownerData?.email || '';
          }

          // Count users in this organization
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', org.id);

          return {
            ...org,
            owner_email: ownerEmail,
            user_count: count || 0
          };
        })
      );

      setOrganizations(transformedData);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to fetch organizations');
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (orgData: CreateOrganizationData) => {
    try {
      // First, check if user exists or create one
      let userId = null;
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', orgData.owner_email)
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user profile (in real app, you'd invite them via email)
        const { data: newUser, error: userError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            email: orgData.owner_email,
            full_name: orgData.owner_email.split('@')[0],
            role: 'org_owner'
          })
          .select()
          .single();

        if (userError) throw userError;
        userId = newUser.id;
      }

      // Create organization
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          owner_id: userId,
          subscription_tier: orgData.subscription_tier,
          subscription_status: orgData.subscription_status,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Update user's org_id
      await supabase
        .from('profiles')
        .update({ org_id: data.id })
        .eq('id', userId);

      return data;
    } catch (err: any) {
      console.error('Error creating organization:', err);
      throw new Error(err.message || 'Failed to create organization');
    }
  };

  const updateOrganization = async (orgId: string, updates: Partial<Organization>) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error updating organization:', err);
      throw new Error(err.message || 'Failed to update organization');
    }
  };

  const deleteOrganization = async (orgId: string) => {
    try {
      // First, remove org_id from all users in this organization
      await supabase
        .from('profiles')
        .update({ org_id: null })
        .eq('org_id', orgId);

      // Then delete the organization
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting organization:', err);
      throw new Error(err.message || 'Failed to delete organization');
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    refetch: fetchOrganizations
  };
};