import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createInquiry, getInquiries, updateInquiry, deleteInquiry, assignInquiryToAgent } from "../services/inquiry/api";
import { InquiryData, AssignInquiryPayload } from "../types/inquiry.types";
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
    queryFn: getInquiries,
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
    mutationFn: updateInquiry,
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
        mutationFn: async ({ inquiryId, agentId, agentName }: AssignInquiryPayload) => {
            return assignInquiryToAgent(inquiryId, agentId, agentName);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['inquiries']);
            toast.success("Inquiry assigned successfully");
        },
        onError: (error) => {
            console.error("Error assigning inquiry:", error);
            toast.error("Failed to assign inquiry");
        }
    });
};
