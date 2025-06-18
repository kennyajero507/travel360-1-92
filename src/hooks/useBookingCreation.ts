
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

interface ConvertToBookingData {
  quote: any;
  additionalData: {
    agentId: string;
    notes: string;
  };
}

export const useBookingCreation = () => {
  const [isConverting, setIsConverting] = useState(false);
  const { profile } = useAuth();

  const checkEligibility = async (quoteId: string) => {
    try {
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) {
        console.error('Error fetching quote:', error);
        return { eligible: false, reason: 'Could not fetch quote data' };
      }

      if (quote.status === 'converted') {
        return { eligible: false, reason: 'Quote has already been converted to a booking' };
      }

      if (!quote.client || !quote.mobile) {
        return { eligible: false, reason: 'Missing required client information' };
      }

      if (!quote.start_date || !quote.end_date) {
        return { eligible: false, reason: 'Missing travel dates' };
      }

      // Fix the type checking for room_arrangements
      if (!quote.room_arrangements || !Array.isArray(quote.room_arrangements) || quote.room_arrangements.length === 0) {
        return { eligible: false, reason: 'No accommodation arrangements specified' };
      }

      return { eligible: true };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return { eligible: false, reason: 'Error checking quote eligibility' };
    }
  };

  const convertQuoteToBooking = async ({ quote, additionalData }: ConvertToBookingData) => {
    setIsConverting(true);
    
    try {
      // Calculate total price
      let totalPrice = 0;
      
      // Safe array checking for room_arrangements
      if (Array.isArray(quote.room_arrangements)) {
        quote.room_arrangements.forEach((room: any) => totalPrice += room.total || 0);
      }
      
      if (Array.isArray(quote.transports)) {
        quote.transports.forEach((transport: any) => totalPrice += transport.total_cost || 0);
      }
      
      if (Array.isArray(quote.transfers)) {
        quote.transfers.forEach((transfer: any) => totalPrice += transfer.total || 0);
      }
      
      if (Array.isArray(quote.activities)) {
        quote.activities.forEach((activity: any) => totalPrice += activity.total_cost || 0);
      }

      // Create booking
      const bookingData = {
        quote_id: quote.id,
        booking_reference: `BK-${Date.now()}`,
        client: quote.client,
        client_email: quote.client_email,
        hotel_name: Array.isArray(quote.room_arrangements) && quote.room_arrangements.length > 0 
          ? quote.room_arrangements[0]?.hotel_name || 'Multiple Hotels'
          : 'Multiple Hotels',
        hotel_id: quote.hotel_id,
        agent_id: additionalData.agentId || profile?.id,
        travel_start: quote.start_date,
        travel_end: quote.end_date,
        total_price: totalPrice,
        room_arrangement: quote.room_arrangements,
        transport: quote.transports,
        transfers: quote.transfers,
        activities: quote.activities,
        status: 'pending',
        notes: additionalData.notes,
        org_id: profile?.org_id
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        toast({
          title: "Error",
          description: "Failed to create booking. Please try again.",
          variant: "destructive"
        });
        return { success: false, error: bookingError };
      }

      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'converted' })
        .eq('id', quote.id);

      if (updateError) {
        console.error('Error updating quote status:', updateError);
        // Don't fail the whole operation for this
      }

      toast({
        title: "Success",
        description: `Booking ${booking.booking_reference} created successfully!`,
      });

      return { success: true, booking };
    } catch (error) {
      console.error('Error converting quote to booking:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsConverting(false);
    }
  };

  return {
    isConverting,
    checkEligibility,
    convertQuoteToBooking
  };
};
