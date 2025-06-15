
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { QuoteData } from "../types/quote.types";
import { Booking, RoomArrangement, BookingTransport, BookingActivity, BookingTransfer } from "../types/booking.types";
import { errorHandler } from "./errorHandlingService";

export class QuoteToBookingService {
  
  async convertQuoteToBooking(quote: QuoteData, additionalData: {
    agentId?: string;
    notes?: string;
  } = {}): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    try {
      console.log('[QuoteToBookingService] Converting quote to booking:', quote.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if quote has an approved hotel
      if (!quote.approved_hotel_id) {
        throw new Error('Quote must have an approved hotel before creating a booking');
      }

      // Generate booking reference
      const bookingReference = `BKG-${Date.now().toString().slice(-6)}`;

      // Map quote data to booking format
      const mappedRoomArrangements: RoomArrangement[] = quote.room_arrangements?.map(room => ({
        room_type: room.room_type,
        adults: room.adults,
        children_with_bed: room.children_with_bed,
        children_no_bed: room.children_no_bed,
        infants: room.infants,
        num_rooms: room.num_rooms,
        total: room.total,
      })) || [];

      const mappedTransports: BookingTransport[] = quote.transports?.map(transport => ({
        mode: transport.type,
        route: `${transport.from} to ${transport.to}`,
        operator: transport.provider,
        cost_per_person: transport.cost_per_person,
        num_passengers: transport.num_passengers,
        total_cost: transport.total_cost,
        description: transport.description,
        notes: transport.notes,
      })) || [];

      const mappedActivities: BookingActivity[] = quote.activities?.map(activity => ({
        name: activity.name,
        description: activity.description,
        date: activity.date,
        cost_per_person: activity.cost_per_person,
        num_people: activity.num_people,
        total_cost: activity.total_cost,
      })) || [];

      const mappedTransfers: BookingTransfer[] = quote.transfers?.map(transfer => ({
        type: transfer.type,
        from: transfer.from,
        to: transfer.to,
        vehicle_type: transfer.vehicle_type,
        cost_per_vehicle: transfer.cost_per_vehicle,
        num_vehicles: transfer.num_vehicles,
        total: transfer.total,
        description: transfer.description,
      })) || [];

      // Get hotel name from approved hotel
      const { data: hotel } = await supabase
        .from('hotels')
        .select('name')
        .eq('id', quote.approved_hotel_id)
        .maybeSingle();

      // Calculate total price
      const totalPrice = this.calculateTotalPrice(quote);

      // Prepare data for database insertion with proper JSON serialization
      const bookingData = {
        booking_reference: bookingReference,
        client: quote.client,
        hotel_name: hotel?.name || 'Approved Hotel',
        hotel_id: quote.approved_hotel_id,
        agent_id: additionalData.agentId || user.id,
        travel_start: quote.start_date,
        travel_end: quote.end_date,
        room_arrangement: JSON.stringify(mappedRoomArrangements),
        transport: JSON.stringify(mappedTransports),
        activities: JSON.stringify(mappedActivities),
        transfers: JSON.stringify(mappedTransfers),
        status: 'pending',
        total_price: totalPrice,
        quote_id: quote.id,
        notes: additionalData.notes || null,
      };

      // Create booking
      const { data: bookingResult, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update quote status to 'converted'
      const { error: quoteUpdateError } = await supabase
        .from('quotes')
        .update({ status: 'converted', updated_at: new Date().toISOString() })
        .eq('id', quote.id);

      if (quoteUpdateError) {
        console.warn('Failed to update quote status:', quoteUpdateError);
      }

      // Transform the result back to proper Booking type
      const transformedBooking: Booking = {
        ...bookingResult,
        room_arrangement: typeof bookingResult.room_arrangement === 'string' 
          ? JSON.parse(bookingResult.room_arrangement) 
          : bookingResult.room_arrangement,
        transport: typeof bookingResult.transport === 'string' 
          ? JSON.parse(bookingResult.transport) 
          : bookingResult.transport,
        activities: typeof bookingResult.activities === 'string' 
          ? JSON.parse(bookingResult.activities) 
          : bookingResult.activities,
        transfers: typeof bookingResult.transfers === 'string' 
          ? JSON.parse(bookingResult.transfers) 
          : bookingResult.transfers,
      };

      toast.success('Quote successfully converted to booking');
      return { success: true, booking: transformedBooking };
    } catch (error) {
      console.error('[QuoteToBookingService] Error converting quote:', error);
      errorHandler.handleError(error, 'convertQuoteToBooking');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private calculateTotalPrice(quote: QuoteData): number {
    const roomTotal = quote.room_arrangements?.reduce((sum, room) => sum + (room.total || 0), 0) || 0;
    const activitiesTotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;
    const transportTotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
    const transfersTotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
    const visaDocTotal = quote.visa_documentation?.reduce((sum, doc) => sum + (doc.cost || 0), 0) || 0;
    
    const subtotal = roomTotal + activitiesTotal + transportTotal + transfersTotal + visaDocTotal;
    
    // Calculate markup
    let markup = 0;
    const markupValue = quote.markup_value || 0;
    const markupType = quote.markup_type || "percentage";
    
    if (markupType === "percentage") {
      markup = (subtotal * markupValue) / 100;
    } else {
      markup = markupValue;
    }
    
    // Add section markups
    const sectionMarkups = quote.sectionMarkups || {};
    const sectionMarkupTotal = Object.entries(sectionMarkups).reduce((total, [section, markup]) => {
      const sectionSubtotal = section === 'accommodation' ? roomTotal :
                             section === 'transport' ? transportTotal :
                             section === 'transfer' ? transfersTotal :
                             section === 'excursion' ? activitiesTotal :
                             section === 'visa_documentation' ? visaDocTotal : 0;
      
      let sectionMarkupAmount = 0;
      if (markup.type === 'percentage') {
        sectionMarkupAmount = (sectionSubtotal * markup.value) / 100;
      } else {
        sectionMarkupAmount = markup.value;
      }
      
      return total + sectionMarkupAmount;
    }, 0);
    
    return subtotal + markup + sectionMarkupTotal;
  }

  async checkQuoteEligibilityForBooking(quoteId: string): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    try {
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('status, approved_hotel_id')
        .eq('id', quoteId)
        .maybeSingle();

      if (error) throw error;
      if (!quote) return { eligible: false, reason: 'Quote not found' };

      if (quote.status === 'converted') {
        return { eligible: false, reason: 'Quote has already been converted to booking' };
      }

      if (!quote.approved_hotel_id) {
        return { eligible: false, reason: 'Quote must have an approved hotel' };
      }

      return { eligible: true };
    } catch (error) {
      console.error('Error checking quote eligibility:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }
}

export const quoteToBookingService = new QuoteToBookingService();
