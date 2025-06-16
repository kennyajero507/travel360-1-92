
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { ErrorHandler } from '../utils/errorHandler';
import { validateField, hotelValidationSchema, roomTypeValidationSchema } from '../utils/validators';

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

// Validation helper
const validateHotelData = (data: Partial<Hotel>): { isValid: boolean; errors: string[] } => {
  const validation = validateField(hotelValidationSchema, data);
  return { isValid: validation.success, errors: validation.errors };
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
        ErrorHandler.handleSupabaseError(error, 'Fetching hotels');
        return [];
      }

      console.log('[HotelService] Fetched hotels:', data?.length || 0);
      return (data || []).map(transformHotelData);
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'getAllHotels');
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
        ErrorHandler.handleSupabaseError(error, 'Fetching hotel details');
        return null;
      }

      return data ? transformHotelData(data) : null;
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'getHotelById');
      return null;
    }
  },

  async createHotel(hotelData: Omit<Hotel, 'id' | 'created_at' | 'updated_at'>): Promise<Hotel | null> {
    try {
      console.log('[HotelService] Creating hotel:', hotelData);
      
      // Validate input data
      const validation = validateHotelData(hotelData);
      if (!validation.isValid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`);
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        ErrorHandler.handleAuthError({ message: 'User not authenticated' });
        return null;
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
        ErrorHandler.handleSupabaseError(error, 'Creating hotel');
        return null;
      }

      toast.success('Hotel created successfully');
      return transformHotelData(data);
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'createHotel');
      return null;
    }
  },

  async updateHotel(id: string, updates: Partial<Hotel>): Promise<Hotel | null> {
    try {
      console.log('[HotelService] Updating hotel:', id, updates);

      // Validate updates
      if (Object.keys(updates).length > 0) {
        const validation = validateHotelData(updates);
        if (!validation.isValid) {
          toast.error(`Validation failed: ${validation.errors.join(', ')}`);
          return null;
        }
      }

      // Ensure isOutOfOrder is preserved for all room types
      if (updates.room_types && Array.isArray(updates.room_types)) {
        const roomValidation = updates.room_types.every(rt => 
          validateField(roomTypeValidationSchema, rt).success
        );
        
        if (!roomValidation) {
          toast.error('Invalid room type data');
          return null;
        }
        
        updates.room_types = updates.room_types.map(rt => ({
          ...rt,
          isOutOfOrder: rt.isOutOfOrder || false
        }));
      }

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
        ErrorHandler.handleSupabaseError(error, 'Updating hotel');
        return null;
      }

      toast.success('Hotel updated successfully');
      return transformHotelData(data);
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'updateHotel');
      return null;
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
        ErrorHandler.handleSupabaseError(error, 'Deleting hotel');
        return false;
      }

      toast.success('Hotel deleted successfully');
      return true;
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'deleteHotel');
      return false;
    }
  },

  async toggleHotelStatus(id: string): Promise<Hotel | null> {
    try {
      console.log('[HotelService] Toggling hotel status:', id);
      
      const hotel = await this.getHotelById(id);
      if (!hotel) {
        toast.error('Hotel not found');
        return null;
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
        ErrorHandler.handleSupabaseError(error, 'Toggling hotel status');
        return null;
      }

      toast.success(`Hotel ${newStatus.toLowerCase()} successfully`);
      return transformHotelData(data);
    } catch (error) {
      ErrorHandler.handleSupabaseError(error, 'toggleHotelStatus');
      return null;
    }
  }
};
