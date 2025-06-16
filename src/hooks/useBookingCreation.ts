
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { QuoteData } from '../types/quote.types';

interface BookingCreationData {
  quote: QuoteData;
  additionalData: {
    agentId: string;
    notes: string;
  };
}

interface BookingCreationResult {
  success: boolean;
  booking?: any;
  error?: string;
}

export const useBookingCreation = () => {
  const [isConverting, setIsConverting] = useState(false);

  const checkEligibility = async (quoteId: string) => {
    try {
      // Check if quote exists and is in approved status
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('status, approved_hotel_id')
        .eq('id', quoteId)
        .maybeSingle();

      if (error) throw error;

      if (!quote) {
        return { eligible: false, reason: 'Quote not found' };
      }

      if (quote.status === 'converted') {
        return { eligible: false, reason: 'Quote has already been converted to a booking' };
      }

      if (quote.status !== 'approved') {
        return { eligible: false, reason: 'Quote must be approved before converting to booking' };
      }

      if (!quote.approved_hotel_id) {
        return { eligible: false, reason: 'No hotel option has been selected for this quote' };
      }

      return { eligible: true };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return { eligible: false, reason: 'Error checking quote eligibility' };
    }
  };

  const convertQuoteToBooking = async ({ 
    quote, 
    additionalData 
  }: BookingCreationData): Promise<BookingCreationResult> => {
    setIsConverting(true);
    
    try {
      // First check eligibility
      const eligibility = await checkEligibility(quote.id);
      if (!eligibility.eligible) {
        toast.error(eligibility.reason || 'Quote is not eligible for conversion');
        return { success: false, error: eligibility.reason };
      }

      // Generate booking reference
      const bookingReference = `BK-${Date.now().toString().slice(-6)}`;

      // Calculate total price from quote
      const accommodationTotal = quote.room_arrangements?.reduce((sum, arr) => sum + (arr.total || 0), 0) || 0;
      const transportTotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
      const transferTotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
      const activityTotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;
      
      const subtotal = accommodationTotal + transportTotal + transferTotal + activityTotal;
      let markupAmount = 0;
      if (quote.markup_type === 'percentage') {
        markupAmount = (subtotal * (quote.markup_value || 0)) / 100;
      } else {
        markupAmount = quote.markup_value || 0;
      }
      const totalPrice = subtotal + markupAmount;

      // Get approved hotel name
      let hotelName = 'Selected Hotel';
      if (quote.approved_hotel_id) {
        const { data: hotel } = await supabase
          .from('hotels')
          .select('name')
          .eq('id', quote.approved_hotel_id)
          .maybeSingle();
        
        if (hotel) {
          hotelName = hotel.name;
        }
      }

      // Create booking
      const bookingData = {
        quote_id: quote.id,
        booking_reference: bookingReference,
        client: quote.client,
        client_email: quote.client_email,
        hotel_id: quote.approved_hotel_id,
        hotel_name: hotelName,
        travel_start: quote.start_date,
        travel_end: quote.end_date,
        total_price: totalPrice,
        agent_id: additionalData.agentId,
        notes: additionalData.notes,
        status: 'confirmed',
        room_arrangement: JSON.stringify(quote.room_arrangements || []),
        transport: JSON.stringify(quote.transports || []),
        transfers: JSON.stringify(quote.transfers || []),
        activities: JSON.stringify(quote.activities || [])
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update quote status to converted
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'converted' })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      toast.success('Quote successfully converted to booking!');
      return { success: true, booking };

    } catch (error) {
      console.error('Error converting quote to booking:', error);
      toast.error('Failed to convert quote to booking');
      return { success: false, error: 'Conversion failed' };
    } finally {
      setIsConverting(false);
    }
  };

  return {
    convertQuoteToBooking,
    checkEligibility,
    isConverting
  };
};
