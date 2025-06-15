
import { supabase } from '../integrations/supabase/client';

export interface HotelRoomInventory {
  id: string;
  hotel_id: string;
  room_type_id: string;
  inventory_date: string; // ISO date string e.g., '2025-06-15'
  booked_units: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const inventoryService = {
  async getInventoryForMonth(hotelId: string, year: number, month: number): Promise<HotelRoomInventory[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const { data, error } = await supabase
      .from('hotel_room_inventory')
      .select('*')
      .eq('hotel_id', hotelId)
      .gte('inventory_date', startDate.toISOString().split('T')[0])
      .lte('inventory_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }

    return data || [];
  },

  async updateInventory(
    hotelId: string,
    roomTypeId: string,
    date: string,
    bookedUnits: number
  ): Promise<HotelRoomInventory> {
    const { data, error } = await supabase
      .from('hotel_room_inventory')
      .upsert({
        hotel_id: hotelId,
        room_type_id: roomTypeId,
        inventory_date: date,
        booked_units: bookedUnits,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'hotel_id,room_type_id,inventory_date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
    
    if (!data) {
        throw new Error("Upsert operation failed to return data.");
    }

    return data;
  },
};
