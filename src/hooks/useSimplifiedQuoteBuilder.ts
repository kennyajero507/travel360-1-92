
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { QuoteData } from '../types/quote.types';
import { useBookingCreation } from './useBookingCreation';

export const useSimplifiedQuoteBuilder = (quote: QuoteData, onQuoteUpdate: (quote: QuoteData) => void) => {
  const [isConverting, setIsConverting] = useState(false);
  const [isComparingHotels, setIsComparingHotels] = useState(false);
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
    if (!quote.hotel_id) {
      toast.error('Please select a hotel first before comparing');
      return;
    }
    
    setIsComparingHotels(true);
    toast.success('Hotel comparison mode activated! You can now add another hotel to compare.');
  }, [quote.hotel_id]);

  const handleToggleComparison = useCallback((enabled: boolean) => {
    setIsComparingHotels(enabled);
    if (enabled) {
      handleAddHotelForComparison();
    } else {
      toast.info('Comparison mode disabled');
    }
  }, [handleAddHotelForComparison]);

  return {
    isConverting,
    isComparingHotels,
    handleConvertToBooking,
    handleAddHotelForComparison,
    handleToggleComparison
  };
};
