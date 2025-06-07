
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export interface Hotel {
  id: string;
  name: string;
  destination: string;
  category: string;
  status: 'Active' | 'Inactive';
  location?: string;
  address?: string;
  description?: string;
  amenities?: string[];
  room_types?: any[];
  images?: string[];
  contact_info?: any;
  pricing?: any;
  policies?: any;
  additional_details?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  org_id?: string;
}

// Helper function to transform database row to Hotel interface
const transformHotelData = (dbRow: any): Hotel => {
  return {
    ...dbRow,
    status: dbRow.status as 'Active' | 'Inactive',
    amenities: Array.isArray(dbRow.amenities) ? dbRow.amenities : [],
    room_types: Array.isArray(dbRow.room_types) ? dbRow.room_types : [],
    images: Array.isArray(dbRow.images) ? dbRow.images : [],
    contact_info: dbRow.contact_info || {},
    pricing: dbRow.pricing || {},
    policies: dbRow.policies || {},
    additional_details: dbRow.additional_details || {}
  };
};

export const hotelService = {
  async getAllHotels(): Promise<Hotel[]> {
    try {
      console.log('[HotelService] Fetching hotels from database');
      
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[HotelService] Error fetching hotels:', error);
        throw error;
      }

      console.log('[HotelService] Fetched hotels:', data?.length || 0);
      return (data || []).map(transformHotelData);
    } catch (error) {
      console.error('[HotelService] Error in getAllHotels:', error);
      toast.error('Failed to load hotels');
      return [];
    }
  },

  async getHotelById(id: string): Promise<Hotel | null> {
    try {
      console.log('[HotelService] Fetching hotel by ID:', id);
      
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[HotelService] Error fetching hotel:', error);
        throw error;
      }

      return data ? transformHotelData(data) : null;
    } catch (error) {
      console.error('[HotelService] Error in getHotelById:', error);
      toast.error('Failed to load hotel details');
      return null;
    }
  },

  async createHotel(hotelData: Omit<Hotel, 'id' | 'created_at' | 'updated_at'>): Promise<Hotel | null> {
    try {
      console.log('[HotelService] Creating hotel:', hotelData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('hotels')
        .insert([{
          ...hotelData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('[HotelService] Error creating hotel:', error);
        toast.error('Failed to create hotel');
        throw error;
      }

      toast.success('Hotel created successfully');
      return transformHotelData(data);
    } catch (error) {
      console.error('[HotelService] Error in createHotel:', error);
      throw error;
    }
  },

  async updateHotel(id: string, updates: Partial<Hotel>): Promise<Hotel | null> {
    try {
      console.log('[HotelService] Updating hotel:', id, updates);
      
      const { data, error } = await supabase
        .from('hotels')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[HotelService] Error updating hotel:', error);
        toast.error('Failed to update hotel');
        throw error;
      }

      toast.success('Hotel updated successfully');
      return transformHotelData(data);
    } catch (error) {
      console.error('[HotelService] Error in updateHotel:', error);
      throw error;
    }
  },

  async deleteHotel(id: string): Promise<boolean> {
    try {
      console.log('[HotelService] Deleting hotel:', id);
      
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[HotelService] Error deleting hotel:', error);
        toast.error('Failed to delete hotel');
        throw error;
      }

      toast.success('Hotel deleted successfully');
      return true;
    } catch (error) {
      console.error('[HotelService] Error in deleteHotel:', error);
      throw error;
    }
  },

  async toggleHotelStatus(id: string): Promise<Hotel | null> {
    try {
      console.log('[HotelService] Toggling hotel status:', id);
      
      // First get current status
      const hotel = await this.getHotelById(id);
      if (!hotel) {
        throw new Error('Hotel not found');
      }

      const newStatus = hotel.status === 'Active' ? 'Inactive' : 'Active';
      
      const { data, error } = await supabase
        .from('hotels')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[HotelService] Error toggling hotel status:', error);
        toast.error('Failed to update hotel status');
        throw error;
      }

      toast.success(`Hotel ${newStatus.toLowerCase()} successfully`);
      return transformHotelData(data);
    } catch (error) {
      console.error('[HotelService] Error in toggleHotelStatus:', error);
      throw error;
    }
  }
};
