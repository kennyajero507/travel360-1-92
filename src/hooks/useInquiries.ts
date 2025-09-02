import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { toast } from 'sonner';

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSimpleAuth();

  const fetchInquiries = async () => {
    if (!profile?.org_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      setError(err.message);
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const createInquiry = async (inquiryData: any) => {
    if (!profile?.id || !profile?.org_id) {
      throw new Error('User must be authenticated and belong to an organization');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          ...inquiryData,
          created_by: profile.id,
          org_id: profile.org_id,
        })
        .select()
        .single();

      if (error) throw error;

      setInquiries(prev => [data, ...prev]);
      toast.success(`Inquiry ${data.enquiry_number} created successfully!`);
      return data;
    } catch (err: any) {
      console.error('Error creating inquiry:', err);
      setError(err.message);
      toast.error('Failed to create inquiry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInquiry = async (id: string, updates: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === id ? { ...inquiry, ...data } : inquiry
      ));
      toast.success('Inquiry updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating inquiry:', err);
      setError(err.message);
      toast.error('Failed to update inquiry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInquiry = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInquiries(prev => prev.filter(inquiry => inquiry.id !== id));
      toast.success('Inquiry deleted successfully');
    } catch (err: any) {
      console.error('Error deleting inquiry:', err);
      setError(err.message);
      toast.error('Failed to delete inquiry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.org_id) {
      fetchInquiries();
    }
  }, [profile?.org_id]);

  return {
    inquiries,
    loading,
    error,
    fetchInquiries,
    createInquiry,
    updateInquiry,
    deleteInquiry,
  };
};