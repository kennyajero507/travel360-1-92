
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quoteToBookingService } from '../services/quoteToBookingService';
import { QuoteData } from '../types/quote.types';
import { Booking } from '../types/booking.types';

export const useBookingCreation = () => {
  const queryClient = useQueryClient();

  const convertQuoteToBookingMutation = useMutation({
    mutationFn: async ({ 
      quote, 
      additionalData 
    }: { 
      quote: QuoteData; 
      additionalData?: { agentId?: string; notes?: string; } 
    }) => {
      return quoteToBookingService.convertQuoteToBooking(quote, additionalData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['quotes'] });
        toast.success('Quote converted to booking successfully!');
      } else {
        toast.error(`Failed to convert quote: ${result.error}`);
      }
    },
    onError: (err: any) => {
      toast.error(`Failed to convert quote: ${err.message}`);
    },
  });

  const checkEligibilityMutation = useMutation({
    mutationFn: (quoteId: string) => {
      return quoteToBookingService.checkQuoteEligibilityForBooking(quoteId);
    },
  });

  return {
    convertQuoteToBooking: convertQuoteToBookingMutation.mutateAsync,
    isConverting: convertQuoteToBookingMutation.isPending,
    checkEligibility: checkEligibilityMutation.mutateAsync,
    isCheckingEligibility: checkEligibilityMutation.isPending,
  };
};
