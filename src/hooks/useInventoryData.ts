
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import { supabase } from '../integrations/supabase/client';

export const useInventoryData = (hotelId: string, year: number, month: number) => {
  const queryClient = useQueryClient();

  const queryKey = ['inventory', hotelId, year, month];

  const { data: inventory = [], isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => inventoryService.getInventoryForMonth(hotelId, year, month),
    enabled: !!hotelId,
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ roomTypeId, date, bookedUnits }: { roomTypeId: string; date: string; bookedUnits: number }) =>
      inventoryService.updateInventory(hotelId, roomTypeId, date, bookedUnits),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', hotelId] });
    },
    onError: (error) => {
      console.error("Failed to update inventory", error);
    }
  });

  // --- Real-time sync logic for hotel_room_inventory ---
  useEffect(() => {
    if (!hotelId) return;

    const channel = supabase
      .channel('hotel_room_inventory-sync-' + hotelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hotel_room_inventory',
          filter: `hotel_id=eq.${hotelId}`,
        },
        (payload) => {
          // On any change (insert/update/delete)
          // Optional: Filter out irrelevant months/years, but for now simply refetch
          queryClient.invalidateQueries({ queryKey: ['inventory', hotelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hotelId, year, month, queryClient]);

  return {
    inventory,
    isLoading,
    isError,
    updateInventory: updateInventoryMutation.mutateAsync,
    isUpdating: updateInventoryMutation.isPending,
  };
};
