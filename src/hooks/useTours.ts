
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tourService } from "../services/tourService";
import { Tour, TourFormData } from "../types/tour.types";
import { toast } from "sonner";

export const useTours = () => {
  const queryClient = useQueryClient();

  const { 
    data: tours = [], 
    isLoading, 
    error 
  } = useQuery<Tour[]>({
    queryKey: ['tours'],
    queryFn: tourService.getAllTours,
  });

  const createTourMutation = useMutation({
    mutationFn: (tour: TourFormData) => 
      tourService.createTour(tour),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success("Tour created successfully");
    },
    onError: (error) => {
      console.error("Error creating tour:", error);
      toast.error("Failed to create tour");
    }
  });

  const updateTourMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TourFormData> }) => 
      tourService.updateTour(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success("Tour updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tour:", error);
      toast.error("Failed to update tour");
    }
  });

  const deleteTourMutation = useMutation({
    mutationFn: tourService.deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success("Tour archived successfully");
    },
    onError: (error) => {
      console.error("Error deleting tour:", error);
      toast.error("Failed to archive tour");
    }
  });

  const duplicateTourMutation = useMutation({
    mutationFn: ({ id, newTitle }: { id: string; newTitle: string }) => 
      tourService.duplicateTour(id, newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success("Tour duplicated successfully");
    },
    onError: (error) => {
      console.error("Error duplicating tour:", error);
      toast.error("Failed to duplicate tour");
    }
  });

  return {
    tours,
    isLoading,
    error,
    createTour: createTourMutation.mutateAsync,
    updateTour: updateTourMutation.mutateAsync,
    deleteTour: deleteTourMutation.mutate,
    duplicateTour: duplicateTourMutation.mutateAsync,
    isCreating: createTourMutation.isPending,
    isUpdating: updateTourMutation.isPending,
    isDeleting: deleteTourMutation.isPending,
    isDuplicating: duplicateTourMutation.isPending,
  };
};

// Backward compatibility
export const useTourTemplates = useTours;
