
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

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

  return {
    inventory,
    isLoading,
    isError,
    updateInventory: updateInventoryMutation.mutateAsync,
    isUpdating: updateInventoryMutation.isPending,
  };
};
