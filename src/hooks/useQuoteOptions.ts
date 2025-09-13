import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import type { QuoteOption } from '../types/quote';

export const useQuoteOptions = (quoteId: string) => {
  const [options, setOptions] = useState<QuoteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    if (!quoteId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quote_options')
        .select('*')
        .eq('quote_id', quoteId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setOptions(data as QuoteOption[] || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching quote options:', err);
      setError('Failed to load quote options');
      toast.error('Failed to load quote options');
    } finally {
      setLoading(false);
    }
  };

  const createOption = async (optionData: Omit<QuoteOption, 'id'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quote_options')
        .insert({
          ...optionData,
          quote_id: quoteId
        })
        .select()
        .single();

      if (error) throw error;

      setOptions(prev => [...prev, data as QuoteOption]);
      toast.success('Quote option created successfully!');
      return data;
    } catch (err: any) {
      console.error('Error creating quote option:', err);
      toast.error('Failed to create quote option');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOption = async (id: string, updates: Partial<QuoteOption>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quote_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOptions(prev => prev.map(option => option.id === id ? data as QuoteOption : option));
      toast.success('Quote option updated successfully!');
      return data;
    } catch (err: any) {
      console.error('Error updating quote option:', err);
      toast.error('Failed to update quote option');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOption = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('quote_options')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOptions(prev => prev.filter(option => option.id !== id));
      toast.success('Quote option deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting quote option:', err);
      toast.error('Failed to delete quote option');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quoteId) {
      fetchOptions();
    }
  }, [quoteId]);

  return {
    options,
    loading,
    error,
    fetchOptions,
    createOption,
    updateOption,
    deleteOption
  };
};