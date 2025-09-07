import { useState, useEffect } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import type { Quote } from '../types/quote';

export const useQuotes = () => {
  const { profile } = useSimpleAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    if (!profile?.org_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuotes(data as Quote[] || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to load quotes');
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData: Partial<Quote>) => {
    try {
      setLoading(true);
      console.log('=== SUPABASE QUOTE INSERT DEBUG ===');
      console.log('Creating quote with data:', quoteData);
      console.log('Profile org_id:', profile?.org_id);
      console.log('Profile id:', profile?.id);
      console.log('Is profile loaded?', !!profile);
      console.log('Is user authenticated?', !!profile?.id);
      
      // Ensure required fields are set
      const insertData = {
        ...quoteData,
        org_id: profile?.org_id,
        created_by: profile?.id,
        status: quoteData.status || 'draft'
      };

      console.log('Final insert data:', insertData);

      const { data, error } = await supabase
        .from('quotes')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        console.error('Supabase quote creation error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Quote created successfully:', data);
      setQuotes(prev => [data as Quote, ...prev]);
      toast.success('Quote created successfully!');
      return data;
    } catch (err: any) {
      console.error('Error creating quote:', err);
      const errorMessage = err?.message || err?.details || 'Unknown error occurred';
      toast.error(`Failed to create quote: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      setLoading(true);
      console.log('Updating quote:', id, 'with data:', updates);
      
      const { data, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Quote update error:', error);
        throw error;
      }

      console.log('Quote updated successfully:', data);
      setQuotes(prev => prev.map(quote => quote.id === id ? data as Quote : quote));
      toast.success('Quote updated successfully!');
      return data;
    } catch (err) {
      console.error('Error updating quote:', err);
      toast.error(`Failed to update quote: ${err.message || 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuotes(prev => prev.filter(quote => quote.id !== id));
      toast.success('Quote deleted successfully!');
    } catch (err) {
      console.error('Error deleting quote:', err);
      toast.error('Failed to delete quote');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getQuote = async (id: string): Promise<Quote | null> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Quote;
    } catch (err) {
      console.error('Error fetching quote:', err);
      toast.error('Failed to load quote');
      return null;
    }
  };

  useEffect(() => {
    if (profile?.org_id) {
      fetchQuotes();
    }
  }, [profile?.org_id]);

  return {
    quotes,
    loading,
    error,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    getQuote
  };
};