import { useState, useEffect } from 'react';
import type { DatabaseInquiry, DatabaseBooking, DatabaseHotel, InquiryFormData, BookingFormData, HotelFormData } from '../types/database';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { errorHandler } from '../services/errorHandler';
import { useAsyncCleanup } from '../utils/cleanup';

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<DatabaseInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSimpleAuth();
  const { isMounted, safeSetState } = useAsyncCleanup();

  const fetchInquiries = async () => {
    if (!profile?.org_id || !isMounted()) return;
    
    safeSetState(setLoading)(true);
    safeSetState(setError)(null);
    
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (isMounted()) {
        setInquiries(data || []);
      }
    } catch (err: any) {
      errorHandler.handleError(err, 'fetchInquiries');
      safeSetState(setError)(err.message);
    } finally {
      safeSetState(setLoading)(false);
    }
  };

  const createInquiry = async (inquiryData: InquiryFormData) => {
    if (!profile?.id || !profile?.org_id) {
      throw new Error('User must be authenticated and belong to an organization');
    }

    safeSetState(setLoading)(true);
    safeSetState(setError)(null);

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

      if (isMounted()) {
        setInquiries(prev => [data, ...prev]);
      }
      return data;
    } catch (err: any) {
      errorHandler.handleError(err, 'createInquiry');
      safeSetState(setError)(err.message);
      throw err;
    } finally {
      safeSetState(setLoading)(false);
    }
  };

  const updateInquiry = async (id: string, updates: Partial<DatabaseInquiry>) => {
    safeSetState(setLoading)(true);
    safeSetState(setError)(null);

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (isMounted()) {
        setInquiries(prev => prev.map(inquiry => 
          inquiry.id === id ? { ...inquiry, ...data } : inquiry
        ));
      }
      return data;
    } catch (err: any) {
      errorHandler.handleError(err, 'updateInquiry');
      safeSetState(setError)(err.message);
      throw err;
    } finally {
      safeSetState(setLoading)(false);
    }
  };

  const deleteInquiry = async (id: string) => {
    safeSetState(setLoading)(true);
    safeSetState(setError)(null);

    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (isMounted()) {
        setInquiries(prev => prev.filter(inquiry => inquiry.id !== id));
      }
    } catch (err: any) {
      errorHandler.handleError(err, 'deleteInquiry');
      safeSetState(setError)(err.message);
      throw err;
    } finally {
      safeSetState(setLoading)(false);
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