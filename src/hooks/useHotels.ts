import { useState, useEffect } from 'react';
import type { DatabaseInquiry, DatabaseBooking, DatabaseHotel, InquiryFormData, BookingFormData, HotelFormData } from '../types/database';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { errorHandler } from '../services/errorHandler';
import { useAsyncCleanup } from '../utils/cleanup';

export const useHotels = () => {
  const [hotels, setHotels] = useState<DatabaseHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSimpleAuth();
  const { isMounted, safeSetState } = useAsyncCleanup();

  const fetchHotels = async () => {
    if (!profile?.org_id || !isMounted()) return;
    
    safeSetState(setLoading)(true);
    safeSetState(setError)(null);
    
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (isMounted()) {
        setHotels(data || []);
      }
    } catch (err: any) {
      errorHandler.handleError(err, 'fetchHotels');
      safeSetState(setError)(err.message);
    } finally {
      safeSetState(setLoading)(false);
    }
  };

  const createHotel = async (hotelData: HotelFormData) => {
    if (!profile?.id || !profile?.org_id) {
      throw new Error('User must be authenticated and belong to an organization');
    }

    safeSetState(setLoading)(true);
    safeSetState(setError)(null);

    try {
      const { data, error } = await supabase
        .from('hotels')
        .insert({
          ...hotelData,
          created_by: profile.id,
          org_id: profile.org_id,
        })
        .select()
        .single();

      if (error) throw error;

      if (isMounted()) {
        setHotels(prev => [data, ...prev]);
      }
      return data;
    } catch (err: any) {
      errorHandler.handleError(err, 'createHotel');
      safeSetState(setError)(err.message);
      throw err;
    } finally {
      safeSetState(setLoading)(false);
    }
  };

  const updateHotel = async (id: string, updates: Partial<DatabaseHotel>) => {
    safeSetState(setLoading)(true);
    safeSetState(setError)(null);

    try {
      const { data, error } = await supabase
        .from('hotels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (isMounted()) {
        setHotels(prev => prev.map(hotel => 
          hotel.id === id ? { ...hotel, ...data } : hotel
        ));
      }
      return data;
    } catch (err: any) {
      errorHandler.handleError(err, 'updateHotel');
      safeSetState(setError)(err.message);
      throw err;
    } finally {
      safeSetState(setLoading)(false);
    }
  };

  const deleteHotel = async (id: string) => {
    safeSetState(setLoading)(true);
    safeSetState(setError)(null);

    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (isMounted()) {
        setHotels(prev => prev.filter(hotel => hotel.id !== id));
      }
    } catch (err: any) {
      errorHandler.handleError(err, 'deleteHotel');
      safeSetState(setError)(err.message);
      throw err;
    } finally {
      safeSetState(setLoading)(false);
    }
  };

  useEffect(() => {
    if (profile?.org_id) {
      fetchHotels();
    }
  }, [profile?.org_id]);

  return {
    hotels,
    loading,
    error,
    fetchHotels,
    createHotel,
    updateHotel,
    deleteHotel,
  };
};