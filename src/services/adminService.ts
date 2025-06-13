
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export interface SystemUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  org_id: string | null;
  organization_name?: string;
  created_at: string;
  last_sign_in?: string;
}

export interface OrganizationDetails {
  id: string;
  name: string;
  owner_id: string | null;
  owner_name?: string;
  owner_email?: string;
  subscription_status: string;
  trial_start: string;
  trial_end: string;
  user_count: number;
  monthly_quote_count: number;
  monthly_booking_count: number;
  created_at: string;
}

export interface SystemStats {
  total_users: number;
  total_organizations: number;
  active_trials: number;
  expired_trials: number;
  paid_subscriptions: number;
  total_quotes_this_month: number;
  total_bookings_this_month: number;
  revenue_this_month: number;
}

export const adminService = {
  // System Statistics
  async getSystemStats(): Promise<SystemStats> {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      const { data: organizations } = await supabase
        .from('organizations')
        .select('subscription_status, monthly_quote_count, monthly_booking_count, trial_end');

      const now = new Date();
      const activeTrials = organizations?.filter(org => 
        org.subscription_status === 'trial' && new Date(org.trial_end) > now
      ).length || 0;

      const expiredTrials = organizations?.filter(org => 
        org.subscription_status === 'trial' && new Date(org.trial_end) <= now
      ).length || 0;

      const paidSubscriptions = organizations?.filter(org => 
        org.subscription_status === 'active'
      ).length || 0;

      const totalQuotes = organizations?.reduce((sum, org) => sum + (org.monthly_quote_count || 0), 0) || 0;
      const totalBookings = organizations?.reduce((sum, org) => sum + (org.monthly_booking_count || 0), 0) || 0;

      return {
        total_users: users?.length || 0,
        total_organizations: organizations?.length || 0,
        active_trials: activeTrials,
        expired_trials: expiredTrials,
        paid_subscriptions: paidSubscriptions,
        total_quotes_this_month: totalQuotes,
        total_bookings_this_month: totalBookings,
        revenue_this_month: 0 // Calculate from actual revenue data
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  },

  // User Management
  async getAllUsers(): Promise<SystemUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          org_id,
          created_at,
          organizations!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(user => ({
        ...user,
        organization_name: user.organizations?.name || null
      })) || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async updateUserRole(userId: string, newRole: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      throw error;
    }
  },

  async suspendUser(userId: string): Promise<void> {
    try {
      // In a full implementation, you'd disable the user in auth.users
      // For now, we'll just update their role to indicate suspension
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'suspended' })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User suspended successfully');
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
      throw error;
    }
  },

  // Organization Management
  async getAllOrganizations(): Promise<OrganizationDetails[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          owner_id,
          subscription_status,
          trial_start,
          trial_end,
          monthly_quote_count,
          monthly_booking_count,
          created_at,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user counts for each organization
      const orgsWithCounts = await Promise.all(
        (data || []).map(async (org) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', org.id);

          return {
            ...org,
            owner_name: org.profiles?.full_name || null,
            owner_email: org.profiles?.email || null,
            user_count: count || 0
          };
        })
      );

      return orgsWithCounts;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  async suspendOrganization(orgId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ subscription_status: 'suspended' })
        .eq('id', orgId);

      if (error) throw error;
      toast.success('Organization suspended successfully');
    } catch (error) {
      console.error('Error suspending organization:', error);
      toast.error('Failed to suspend organization');
      throw error;
    }
  },

  async deleteOrganization(orgId: string): Promise<void> {
    try {
      // First, remove all users from the organization
      await supabase
        .from('profiles')
        .update({ org_id: null, role: 'client' })
        .eq('org_id', orgId);

      // Then delete the organization
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;
      toast.success('Organization deleted successfully');
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
      throw error;
    }
  }
};
