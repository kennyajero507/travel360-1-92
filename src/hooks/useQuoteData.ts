
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllQuotes, 
  deleteQuote, 
  emailQuote, 
  printQuote, 
  downloadQuotePDF 
} from "../services/quoteService";
import { enhancedQuoteService } from "../services/enhancedQuoteService";
import { QuoteData } from "../types/quote.types";
import { toast } from "sonner";

export const useQuoteData = () => {
  const queryClient = useQueryClient();

  // Fetch quotes
  const { 
    data: quotes = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['quotes'],
    queryFn: getAllQuotes,
  });

  // Create quote mutation using enhanced service
  const createQuoteMutation = useMutation({
    mutationFn: (quote: QuoteData) => enhancedQuoteService.saveQuote(quote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
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
      toast.success("Quote sent via email");
    },
    onError: (error) => {
      console.error("Error emailing quote:", error);
      toast.error("Failed to send quote via email");
    }
  });

  // Print quote mutation
  const printQuoteMutation = useMutation({
    mutationFn: printQuote,
    onSuccess: () => {
      toast.success("Quote sent to printer");
    },
    onError: (error) => {
      console.error("Error printing quote:", error);
      toast.error("Failed to print quote");
    }
  });

  // Download PDF mutation
  const downloadPDFMutation = useMutation({
    mutationFn: downloadQuotePDF,
    onSuccess: () => {
      toast.success("Quote PDF downloaded");
    },
    onError: (error) => {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  });

  return {
    quotes,
    loading: isLoading,
    isLoading,
    error,
    createQuote: createQuoteMutation.mutateAsync,
    updateQuote: updateQuoteMutation.mutateAsync,
    deleteQuote: deleteQuoteMutation.mutateAsync,
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
