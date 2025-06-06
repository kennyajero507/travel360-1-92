
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export const useInquiryData = () => {
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading, error } = useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      console.log('[useInquiryData] Fetching inquiries from database');
      
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useInquiryData] Error fetching inquiries:', error);
        throw error;
      }

      console.log('[useInquiryData] Fetched inquiries:', data?.length || 0);
      return data || [];
    },
  });

  const createInquiry = async (inquiryData: any) => {
    try {
      console.log('[useInquiryData] Creating inquiry:', inquiryData);
      
      const { data, error } = await supabase
        .from('inquiries')
        .insert([inquiryData])
        .select()
        .single();

      if (error) {
        console.error('[useInquiryData] Error creating inquiry:', error);
        toast.error('Failed to create inquiry');
        throw error;
      }

      console.log('[useInquiryData] Inquiry created successfully:', data);
      toast.success('Inquiry created successfully');
      
      // Invalidate and refetch inquiries
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      
      return data;
    } catch (error) {
      console.error('[useInquiryData] Error in createInquiry:', error);
      throw error;
    }
  };

  const updateInquiry = async (inquiryId: string, updates: any) => {
    try {
      console.log('[useInquiryData] Updating inquiry:', inquiryId, updates);
      
      const { data, error } = await supabase
        .from('inquiries')
        .update(updates)
        .eq('id', inquiryId)
        .select()
        .single();

      if (error) {
        console.error('[useInquiryData] Error updating inquiry:', error);
        toast.error('Failed to update inquiry');
        throw error;
      }

      console.log('[useInquiryData] Inquiry updated successfully:', data);
      toast.success('Inquiry updated successfully');
      
      // Invalidate and refetch inquiries
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      
      return data;
    } catch (error) {
      console.error('[useInquiryData] Error in updateInquiry:', error);
      throw error;
    }
  };

  return {
    inquiries: inquiries || [],
    isLoading,
    error,
    createInquiry,
    updateInquiry
  };
};
