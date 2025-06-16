
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tourTemplateService } from "../services/tourTemplateService";
import { TourTemplate, TourTemplateFormData } from "../types/tour.types";
import { toast } from "sonner";

export const useTourTemplates = () => {
  const queryClient = useQueryClient();

  const { 
    data: tourTemplates = [], 
    isLoading, 
    error 
  } = useQuery<TourTemplate[]>({
    queryKey: ['tour-templates'],
    queryFn: tourTemplateService.getAllTourTemplates,
  });

  const createTourTemplateMutation = useMutation({
    mutationFn: (tourTemplate: TourTemplateFormData) => 
      tourTemplateService.createTourTemplate(tourTemplate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-templates'] });
      toast.success("Tour template created successfully");
    },
    onError: (error) => {
      console.error("Error creating tour template:", error);
      toast.error("Failed to create tour template");
    }
  });

  const updateTourTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TourTemplateFormData> }) => 
      tourTemplateService.updateTourTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-templates'] });
      toast.success("Tour template updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tour template:", error);
      toast.error("Failed to update tour template");
    }
  });

  const deleteTourTemplateMutation = useMutation({
    mutationFn: tourTemplateService.deleteTourTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-templates'] });
      toast.success("Tour template archived successfully");
    },
    onError: (error) => {
      console.error("Error deleting tour template:", error);
      toast.error("Failed to archive tour template");
    }
  });

  const duplicateTourTemplateMutation = useMutation({
    mutationFn: ({ id, newTitle }: { id: string; newTitle: string }) => 
      tourTemplateService.duplicateTourTemplate(id, newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-templates'] });
      toast.success("Tour template duplicated successfully");
    },
    onError: (error) => {
      console.error("Error duplicating tour template:", error);
      toast.error("Failed to duplicate tour template");
    }
  });

  return {
    tourTemplates,
    isLoading,
    error,
    createTourTemplate: createTourTemplateMutation.mutateAsync,
    updateTourTemplate: updateTourTemplateMutation.mutateAsync,
    deleteTourTemplate: deleteTourTemplateMutation.mutate,
    duplicateTourTemplate: duplicateTourTemplateMutation.mutateAsync,
    isCreating: createTourTemplateMutation.isPending,
    isUpdating: updateTourTemplateMutation.isPending,
    isDeleting: deleteTourTemplateMutation.isPending,
    isDuplicating: duplicateTourTemplateMutation.isPending,
  };
};
