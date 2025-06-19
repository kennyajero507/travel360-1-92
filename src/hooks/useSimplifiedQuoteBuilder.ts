
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { QuoteData } from '../types/quote.types';
import { useBookingCreation } from './useBookingCreation';

export const useSimplifiedQuoteBuilder = (quote: QuoteData, onQuoteUpdate: (quote: QuoteData) => void) => {
  const [isConverting, setIsConverting] = useState(false);
  const { convertQuoteToBooking } = useBookingCreation();

  const handleConvertToBooking = useCallback(async () => {
    if (!quote.id) {
      toast.error('Quote must be saved before converting to booking');
      return;
    }

    setIsConverting(true);
    try {
      const result = await convertQuoteToBooking({
        quote,
        additionalData: {
          agentId: quote.created_by || '',
          notes: `Converted from quote ${quote.id}`
        }
      });

      if (result.success) {
        toast.success('Quote successfully converted to booking!');
        // Optionally navigate to bookings page or show booking details
      }
    } catch (error) {
      console.error('Error converting to booking:', error);
      toast.error('Failed to convert quote to booking');
    } finally {
      setIsConverting(false);
    }
  }, [quote, convertQuoteToBooking]);

  const handleAddHotelForComparison = useCallback(() => {
    // This would trigger the multi-hotel comparison mode
    toast.info('Hotel comparison feature coming soon!');
  }, []);

  return {
    isConverting,
    handleConvertToBooking,
    handleAddHotelForComparison
  };
};
