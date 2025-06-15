
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllQuotes, deleteQuote } from "../services/quote/core";
import { emailQuote, printQuote, downloadQuotePDF } from "../services/quote/client";
import { enhancedQuoteService } from "../services/enhancedQuoteService";
import { getAvailableInquiries } from "../services/inquiry/api";
import { QuoteData } from "../types/quote.types";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useRealtimeSync } from "./useRealtimeSync";

export const useQuoteData = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const orgId = profile?.org_id;

  // Real-time sync for quotes table
  useRealtimeSync({
    table: 'quotes',
    orgId,
    queryKeysInvalidate: ['quotes', 'available-inquiries'],
    queryClient,
  });

  // Fetch quotes
  const { 
    data: quotes = [], 
    isLoading, 
    error 
  } = useQuery<QuoteData[]>({
    queryKey: ['quotes'],
    queryFn: getAllQuotes,
  });

  // Fetch available inquiries for quote creation
  const { 
    data: availableInquiries = [], 
    isLoading: isLoadingInquiries 
  } = useQuery({
    queryKey: ['available-inquiries'],
    queryFn: getAvailableInquiries,
  });

  // Create quote mutation using enhanced service
  const createQuoteMutation = useMutation({
    mutationFn: (quote: QuoteData) => enhancedQuoteService.saveQuote(quote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      // If quote was created from inquiry, invalidate inquiries too
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['available-inquiries'] });
      toast.success("Quote created successfully");
    },
    onError: (error) => {
      console.error("Error creating quote:", error);
      toast.error("Failed to create quote");
    }
  });

  // Update quote mutation using enhanced service
  const updateQuoteMutation = useMutation({
    mutationFn: (quote: QuoteData) => enhancedQuoteService.saveQuote(quote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success("Quote updated successfully");
    },
    onError: (error) => {
      console.error("Error updating quote:", error);
      toast.error("Failed to update quote");
    }
  });

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success("Quote deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting quote:", error);
      toast.error("Failed to delete quote");
    }
  });

  // Email quote mutation
  const emailQuoteMutation = useMutation({
    mutationFn: emailQuote,
    onSuccess: () => {
      // The service itself toasts, so no need to double-toast
    },
    onError: (error) => {
      // The service itself toasts, so we just log
      console.error("Error emailing quote:", error);
    }
  });

  // Print quote mutation
  const printQuoteMutation = useMutation({
    mutationFn: printQuote,
    onSuccess: () => {
      // The service itself toasts
    },
    onError: (error) => {
      console.error("Error printing quote:", error);
      // The service itself toasts
    }
  });

  // Download PDF mutation
  const downloadPDFMutation = useMutation({
    mutationFn: downloadQuotePDF,
    onSuccess: () => {
      // The service itself toasts
    },
    onError: (error) => {
      console.error("Error downloading PDF:", error);
      // The service itself toasts
    }
  });

  return {
    quotes,
    availableInquiries,
    loading: isLoading,
    isLoading,
    isLoadingInquiries,
    error,
    createQuote: createQuoteMutation.mutateAsync,
    updateQuote: updateQuoteMutation.mutateAsync,
    deleteQuote: deleteQuoteMutation.mutate,
    emailQuote: emailQuoteMutation.mutateAsync,
    printQuote: printQuoteMutation.mutateAsync,
    downloadQuotePDF: downloadPDFMutation.mutateAsync,
    isCreating: createQuoteMutation.isPending,
    isUpdating: updateQuoteMutation.isPending,
    isDeleting: deleteQuoteMutation.isPending,
    // Enhanced service methods
    enhancedService: enhancedQuoteService
  };
};
