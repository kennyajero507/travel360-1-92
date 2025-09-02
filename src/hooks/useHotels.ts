import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { toast } from 'sonner';

export const useHotels = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSimpleAuth();

  const fetchHotels = async () => {
    if (!profile?.org_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (err: any) {
      console.error('Error fetching hotels:', err);
      setError(err.message);
      toast.error('Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  const createHotel = async (hotelData: any) => {
    if (!profile?.id || !profile?.org_id) {
      throw new Error('User must be authenticated and belong to an organization');
    }

    setLoading(true);
    setError(null);

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

      setHotels(prev => [data, ...prev]);
      toast.success('Hotel created successfully!');
      return data;
    } catch (err: any) {
      console.error('Error creating hotel:', err);
      setError(err.message);
      toast.error('Failed to create hotel');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHotel = async (id: string, updates: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('hotels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setHotels(prev => prev.map(hotel => 
        hotel.id === id ? { ...hotel, ...data } : hotel
      ));
      toast.success('Hotel updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating hotel:', err);
      setError(err.message);
      toast.error('Failed to update hotel');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHotel = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHotels(prev => prev.filter(hotel => hotel.id !== id));
      toast.success('Hotel deleted successfully');
    } catch (err: any) {
      console.error('Error deleting hotel:', err);
      setError(err.message);
      toast.error('Failed to delete hotel');
      throw err;
    } finally {
      setLoading(false);
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