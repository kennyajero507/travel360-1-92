
// Restored: Quote Hotel Options database logic is now available for use.
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

export interface QuoteHotelOption {
  id: string;
  quote_id: string;
  hotel_id: string;
  option_name: string;
  total_price: number;
  currency_code: string;
  is_selected: boolean;
  room_arrangements: any[];
  created_at: string;
  hotel?: {
    id: string;
    name: string;
    category: string;
    destination: string;
    images: string[];
  };
}

export const quoteHotelOptionsService = {
  async getOptionsByQuoteId(quoteId: string): Promise<QuoteHotelOption[]> {
    try {
      const { data, error } = await supabase
        .from('quote_hotel_options')
        .select(`
          *,
          hotels (
            id,
            name,
            category,
            destination,
            images
          )
        `)
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(option => ({
        ...option,
        room_arrangements: typeof option.room_arrangements === 'string' 
          ? JSON.parse(option.room_arrangements) 
          : option.room_arrangements || [],
        hotel: option.hotels ? {
          id: option.hotels.id,
          name: option.hotels.name,
          category: option.hotels.category,
          destination: option.hotels.destination,
          images: Array.isArray(option.hotels.images) 
            ? option.hotels.images.filter((img): img is string => typeof img === 'string')
            : []
        } : undefined
      }));
    } catch (error) {
      console.error('Error fetching quote hotel options:', error);
      return [];
    }
  },

  async createOption(optionData: Omit<QuoteHotelOption, 'id' | 'created_at'>): Promise<QuoteHotelOption | null> {
    try {
      const { data, error } = await supabase
        .from('quote_hotel_options')
        .insert([{
          ...optionData,
          room_arrangements: JSON.stringify(optionData.room_arrangements)
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        room_arrangements: typeof data.room_arrangements === 'string' 
          ? JSON.parse(data.room_arrangements) 
          : data.room_arrangements || []
      };
    } catch (error) {
      console.error('Error creating quote hotel option:', error);
      toast.error('Failed to create hotel option');
      return null;
    }
  },

  async updateOption(id: string, updates: Partial<QuoteHotelOption>): Promise<QuoteHotelOption | null> {
    try {
      const updateData: any = { ...updates };
      if (updates.room_arrangements) {
        updateData.room_arrangements = JSON.stringify(updates.room_arrangements);
      }

      const { data, error } = await supabase
        .from('quote_hotel_options')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        room_arrangements: typeof data.room_arrangements === 'string' 
          ? JSON.parse(data.room_arrangements) 
          : data.room_arrangements || []
      };
    } catch (error) {
      console.error('Error updating quote hotel option:', error);
      toast.error('Failed to update hotel option');
      return null;
    }
  },

  async selectOption(optionId: string, quoteId: string): Promise<boolean> {
    try {
      // First, deselect all options for this quote
      await supabase
        .from('quote_hotel_options')
        .update({ is_selected: false })
        .eq('quote_id', quoteId);

      // Then select the chosen option
      const { error } = await supabase
        .from('quote_hotel_options')
        .update({ is_selected: true })
        .eq('id', optionId);

      if (error) throw error;

      // Update the main quote with the selected option
      await supabase
        .from('quotes')
        .update({
          selected_hotel_option_id: optionId,
          client_selection_date: new Date().toISOString()
        })
        .eq('id', quoteId);

      toast.success('Hotel option selected successfully');
      return true;
    } catch (error) {
      console.error('Error selecting hotel option:', error);
      toast.error('Failed to select hotel option');
      return false;
    }
  },

  async deleteOption(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('quote_hotel_options')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Hotel option deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting hotel option:', error);
      toast.error('Failed to delete hotel option');
      return false;
    }
  }
};
