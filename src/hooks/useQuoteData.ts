
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export const useQuoteData = () => {
  const queryClient = useQueryClient();

  const { data: quotes, isLoading, error } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      console.log('[useQuoteData] Fetching quotes from database');
      
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useQuoteData] Error fetching quotes:', error);
        throw error;
      }

      console.log('[useQuoteData] Fetched quotes:', data?.length || 0);
      return data || [];
    },
  });

  const createQuote = async (quoteData: any) => {
    try {
      console.log('[useQuoteData] Creating quote:', quoteData);
      
      const { data, error } = await supabase
        .from('quotes')
        .insert([quoteData])
        .select()
        .single();

      if (error) {
        console.error('[useQuoteData] Error creating quote:', error);
        toast.error('Failed to create quote');
        throw error;
      }

      console.log('[useQuoteData] Quote created successfully:', data);
      toast.success('Quote created successfully');
      
      // Invalidate and refetch quotes
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      return data;
    } catch (error) {
      console.error('[useQuoteData] Error in createQuote:', error);
      throw error;
    }
  };

  const updateQuote = async (quoteId: string, updates: any) => {
    try {
      console.log('[useQuoteData] Updating quote:', quoteId, updates);
      
      const { data, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', quoteId)
        .select()
        .single();

      if (error) {
        console.error('[useQuoteData] Error updating quote:', error);
        toast.error('Failed to update quote');
        throw error;
      }

      console.log('[useQuoteData] Quote updated successfully:', data);
      toast.success('Quote updated successfully');
      
      // Invalidate and refetch quotes
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      return data;
    } catch (error) {
      console.error('[useQuoteData] Error in updateQuote:', error);
      throw error;
    }
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      console.log('[useQuoteData] Deleting quote:', quoteId);
      
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

      if (error) {
        console.error('[useQuoteData] Error deleting quote:', error);
        toast.error('Failed to delete quote');
        throw error;
      }

      console.log('[useQuoteData] Quote deleted successfully');
      toast.success('Quote deleted successfully');
      
      // Invalidate and refetch quotes
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    } catch (error) {
      console.error('[useQuoteData] Error in deleteQuote:', error);
      throw error;
    }
  };

  return {
    quotes: quotes || [],
    isLoading,
    error,
    createQuote,
    updateQuote,
    deleteQuote
  };
};
