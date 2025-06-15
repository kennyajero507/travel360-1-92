import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createInquiry, getAllInquiries, updateInquiry, deleteInquiry, assignInquiryToAgent } from "../services/inquiry/api";
import { InquiryData } from "../types/inquiry.types";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useRealtimeSync } from "./useRealtimeSync";

export const useInquiries = () => {
  const queryClient = useQueryClient();

  // Add real-time sync for inquiries table
  const { profile } = useAuth?.() || {};
  const orgId = profile?.org_id;

  useRealtimeSync({
    table: 'inquiries',
    orgId,
    queryKeysInvalidate: ['inquiries'],
    queryClient,
  });

  const { data: inquiries = [], isLoading, refetch } = useQuery<InquiryData[]>({
    queryKey: ['inquiries'],
    queryFn: getAllInquiries,
  });

  const createInquiryMutation = useMutation({
    mutationFn: createInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success("Inquiry created successfully");
    },
    onError: (error) => {
      console.error("Error creating inquiry:", error);
      toast.error("Failed to create inquiry");
    }
  });

  const updateInquiryMutation = useMutation({
    mutationFn: ({ inquiryId, updates }: { inquiryId: string, updates: Partial<InquiryData> }) =>
      updateInquiry(inquiryId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success("Inquiry updated successfully");
    },
    onError: (error) => {
      console.error("Error updating inquiry:", error);
      toast.error("Failed to update inquiry");
    }
  });

  const deleteInquiryMutation = useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success("Inquiry deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry");
    }
  });

  return {
    inquiries,
    isLoading,
    refetch,
    createInquiry: createInquiryMutation.mutateAsync,
    updateInquiry: updateInquiryMutation.mutateAsync,
    deleteInquiry: deleteInquiryMutation.mutateAsync,
    isCreating: createInquiryMutation.isPending,
    isUpdating: updateInquiryMutation.isPending,
    isDeleting: deleteInquiryMutation.isPending,
  };
};

export const useAssignInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inquiryId,
      agentId,
      agentName
    }: { inquiryId: string; agentId: string; agentName: string }) =>
      assignInquiryToAgent(inquiryId, agentId, agentName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success("Inquiry assigned successfully");
    },
    onError: (error) => {
      console.error("Error assigning inquiry:", error);
      toast.error("Failed to assign inquiry");
    }
  });
};
