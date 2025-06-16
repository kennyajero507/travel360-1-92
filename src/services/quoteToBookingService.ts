
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { QuoteData } from '../types/quote.types';
import { Booking, RoomArrangement, BookingTransport, BookingActivity, BookingTransfer } from '../types/booking.types';
import { ErrorHandler } from '../utils/errorHandler';

export interface ConvertQuoteResult {
  success: boolean;
  booking?: Booking;
  error?: string;
}

export interface QuoteEligibilityResult {
  eligible: boolean;
  reason?: string;
}

export const quoteToBookingService = {
  async checkQuoteEligibilityForBooking(quoteId: string): Promise<QuoteEligibilityResult> {
    try {
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('status, approved_hotel_id')
        .eq('id', quoteId)
        .single();

      if (error) {
        return { eligible: false, reason: 'Quote not found' };
      }

      if (quote.status === 'converted') {
        return { eligible: false, reason: 'Quote has already been converted to a booking' };
      }

      if (!quote.approved_hotel_id) {
        return { eligible: false, reason: 'Quote must have an approved hotel before conversion' };
      }

      if (quote.status !== 'approved') {
        return { eligible: false, reason: 'Quote must be approved before conversion' };
      }

      return { eligible: true };
    } catch (error) {
      console.error('[QuoteToBookingService] Error checking eligibility:', error);
      return { eligible: false, reason: 'Error checking quote eligibility' };
    }
  },

  async convertQuoteToBooking(
    quote: QuoteData, 
    additionalData?: { agentId?: string; notes?: string; }
  ): Promise<ConvertQuoteResult> {
    try {
      console.log('[QuoteToBookingService] Converting quote to booking:', quote.id);

      // First check eligibility
      const eligibility = await this.checkQuoteEligibilityForBooking(quote.id);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason };
      }

      // Get hotel details
      const { data: hotel, error: hotelError } = await supabase
        .from('hotels')
        .select('name')
        .eq('id', quote.approved_hotel_id)
        .single();

      if (hotelError) {
        return { success: false, error: 'Failed to fetch hotel details' };
      }

      // Map quote data to booking structure
      const mappedRoomArrangements: RoomArrangement[] = (quote.room_arrangements || []).map(room => ({
        room_type: room.room_type || 'Standard',
        adults: room.adults || 0,
        children_with_bed: room.children_with_bed || 0,
        children_no_bed: room.children_no_bed || 0,
        infants: room.infants || 0,
        num_rooms: room.num_rooms || 1,
        rate_per_night: room.rate_per_night || 0,
        total: room.total || 0,
      }));

      const mappedTransports: BookingTransport[] = (quote.transports || []).map(transport => ({
        mode: transport.type || transport.mode || 'Flight',
        route: `${transport.from || ''} to ${transport.to || ''}`,
        operator: transport.provider || transport.operator,
        cost_per_person: transport.cost_per_person || 0,
        num_passengers: transport.num_passengers || 0,
        total_cost: transport.total_cost || 0,
        description: transport.description,
        notes: transport.notes,
      }));

      const mappedActivities: BookingActivity[] = (quote.activities || []).map(activity => ({
        name: activity.name || activity.activity_type || 'Activity',
        description: activity.description,
        date: activity.date,
        cost_per_person: activity.cost_per_person || activity.adult_cost || 0,
        num_people: activity.num_people || activity.number_of_people || 0,
        total_cost: activity.total_cost || 0,
      }));

      const mappedTransfers: BookingTransfer[] = (quote.transfers || []).map(transfer => ({
        type: transfer.type || transfer.transfer_type || 'Airport Transfer',
        from: transfer.from || '',
        to: transfer.to || '',
        vehicle_type: transfer.vehicle_type || 'Standard',
        cost_per_vehicle: transfer.cost_per_vehicle || transfer.adult_cost || 0,
        num_vehicles: transfer.num_vehicles || 1,
        total: transfer.total || 0,
        description: transfer.description,
      }));

      // Calculate total price
      const roomTotal = mappedRoomArrangements.reduce((sum, room) => sum + (room.total || 0), 0);
      const activitiesTotal = mappedActivities.reduce((sum, activity) => sum + (activity.total_cost || 0), 0);
      const transportTotal = mappedTransports.reduce((sum, transport) => sum + (transport.total_cost || 0), 0);
      const transfersTotal = mappedTransfers.reduce((sum, transfer) => sum + (transfer.total || 0), 0);
      const subtotal = roomTotal + activitiesTotal + transportTotal + transfersTotal;
      
      const markupValue = quote.markup_value || 0;
      const markupType = quote.markup_type || "percentage";
      let markup = 0;
      if (markupType === "percentage") {
        markup = (subtotal * markupValue) / 100;
      } else {
        markup = markupValue;
      }
      const totalPrice = subtotal + markup;

      // Create booking data
      const bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'> = {
        booking_reference: `BKG-${Date.now().toString().slice(-6)}`,
        client: quote.client,
        client_email: quote.client_email,
        hotel_name: hotel.name,
        hotel_id: quote.approved_hotel_id,
        agent_id: additionalData?.agentId,
        travel_start: quote.start_date,
        travel_end: quote.end_date,
        room_arrangement: mappedRoomArrangements,
        transport: mappedTransports,
        activities: mappedActivities,
        transfers: mappedTransfers,
        status: 'pending',
        total_price: totalPrice,
        quote_id: quote.id,
        notes: additionalData?.notes || quote.notes,
      };

      // Insert booking into database
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (bookingError) {
        console.error('[QuoteToBookingService] Error creating booking:', bookingError);
        return { success: false, error: 'Failed to create booking' };
      }

      // Update quote status to converted
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ 
          status: 'converted',
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (updateError) {
        console.error('[QuoteToBookingService] Error updating quote status:', updateError);
        // Don't fail the conversion, just log the error
      }

      return { success: true, booking: booking as Booking };
    } catch (error) {
      console.error('[QuoteToBookingService] Error converting quote:', error);
      ErrorHandler.handleSupabaseError(error, 'convertQuoteToBooking');
      return { success: false, error: 'Failed to convert quote to booking' };
    }
  }
};
