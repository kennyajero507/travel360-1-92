
// Provide hooks for inquiry data against actual Supabase tables.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllInquiries, assignInquiryToAgent } from "../services/inquiry/api";
import { InquiryData } from "../types/inquiry.types";
import { toast } from "sonner";

// Fetch all inquiries
export const useInquiryData = () => {
  const {
    data: inquiries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inquiries"],
    queryFn: getAllInquiries,
  });

  return { inquiries, isLoading, error };
};

// List and refetch for inquiries (used in tables etc)
export const useInquiries = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["inquiries"],
    queryFn: getAllInquiries,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
};

// Assign inquiry to agent mutation
export const useAssignInquiry = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ inquiryId, agentId, agentName }: { inquiryId: string; agentId: string; agentName: string }) =>
      assignInquiryToAgent(inquiryId, agentId, agentName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast.success("Inquiry assigned successfully.");
    },
    onError: (err) => {
      toast.error("Failed to assign inquiry.");
      console.error(err);
    }
  });

  return {
    isPending: mutation.isPending,
    mutate: mutation.mutate,
  };
};
