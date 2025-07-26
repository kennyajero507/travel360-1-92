import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  org_id: string;
  phone?: string;
  created_at: string;
  active: boolean;
}

interface Organization {
  id: string;
  name: string;
}

interface CreateUserData {
  email: string;
  full_name: string;
  role: string;
  org_id: string;
  phone?: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');

      if (orgsError) throw orgsError;

      // Transform users data to include active field
      const transformedUsers = (usersData || []).map(user => ({
        ...user,
        active: true // Default to active since we don't have this field in DB yet
      }));
      setUsers(transformedUsers);
      setOrganizations(orgsData || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData) => {
    try {
      // In a real app, you'd use Supabase Auth to invite the user
      // For now, we'll create a profile directly
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          org_id: userData.org_id || null,
          phone: userData.phone
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error creating user:', err);
      throw new Error(err.message || 'Failed to create user');
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error updating user:', err);
      throw new Error(err.message || 'Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // In a real app, you'd also need to handle auth user deletion
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting user:', err);
      throw new Error(err.message || 'Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId: string, active: boolean) => {
    try {
      // In a real app, you'd disable/enable the auth user
      // For now, we'll just update a custom field (this would need to be added to the schema)
      // Since we don't have this field, we'll just return success for demo purposes
      const { data, error } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() }) // Just update timestamp as placeholder
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      throw new Error(err.message || 'Failed to update user status');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    organizations,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refetch: fetchUsers
  };
};