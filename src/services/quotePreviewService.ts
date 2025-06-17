
import { supabase } from '../integrations/supabase/client';
import { QuoteData, ClientQuotePreview, HotelOption, QuoteStatus } from '../types/quote.types';

interface QuotePreviewData {
  quote: QuoteData;
  organization?: any;
  calculations: {
    accommodation_total: number;
    transport_total: number;
    transfer_total: number;
    activity_total: number;
    subtotal: number;
    markup_amount: number;
    grand_total: number;
  };
}

class QuotePreviewService {
  async generateClientPreview(quoteId: string): Promise<ClientQuotePreview | null> {
    try {
      console.log('[QuotePreviewService] Generating preview for quote:', quoteId);

      // Fetch the quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) {
        console.error('[QuotePreviewService] Error fetching quote:', quoteError);
        throw quoteError;
      }

      if (!quote) {
        console.error('[QuotePreviewService] Quote not found:', quoteId);
        return null;
      }

      // Transform the quote data with proper type casting
      const transformedQuote: QuoteData = {
        ...quote,
        status: (quote.status as QuoteStatus) || 'draft',
        tour_type: (quote.tour_type as 'domestic' | 'international') || 'domestic',
        room_arrangements: this.parseJsonField(quote.room_arrangements, []),
        activities: this.parseJsonField(quote.activities, []),
        transports: this.parseJsonField(quote.transports, []),
        transfers: this.parseJsonField(quote.transfers, []),
        sectionMarkups: this.parseJsonField(quote.sectionmarkups, {}),
        visa_documentation: this.parseJsonField(quote.visa_documentation, []),
        document_checklist: this.parseJsonField(quote.document_checklist, []),
        itinerary: this.parseJsonField(quote.itinerary, []),
        summary_data: this.parseJsonField(quote.summary_data, undefined)
      };

      // Calculate totals
      const calculations = this.calculateTotals(transformedQuote);

      // Get hotel data for options
      const hotelIds = new Set<string>();
      if (transformedQuote.hotel_id) hotelIds.add(transformedQuote.hotel_id);
      
      // Collect hotel IDs from room arrangements
      transformedQuote.room_arrangements?.forEach(room => {
        if (room.hotel_id) hotelIds.add(room.hotel_id);
      });

      let hotelOptions: HotelOption[] = [];
      if (hotelIds.size > 0) {
        const { data: hotels } = await supabase
          .from('hotels')
          .select('*')
          .in('id', Array.from(hotelIds));

        hotelOptions = (hotels || []).map((hotel: any) => {
          // Calculate total price for this hotel from room arrangements
          const hotelRooms = transformedQuote.room_arrangements?.filter(room => room.hotel_id === hotel.id) || [];
          const totalPrice = hotelRooms.reduce((sum, room) => sum + (room.total || 0), 0);
          const avgPricePerNight = hotelRooms.length > 0 && transformedQuote.duration_nights > 0 
            ? totalPrice / transformedQuote.duration_nights / hotelRooms.length 
            : 0;

          return {
            id: hotel.id,
            name: hotel.name,
            category: hotel.category || 'Standard',
            pricePerNight: avgPricePerNight,
            totalPrice: totalPrice,
            currencyCode: transformedQuote.currency_code || 'KES',
            selected: hotel.id === transformedQuote.hotel_id
          };
        });
      }

      // Try to fetch organization details (optional)
      let organization = null;
      if (quote.org_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', quote.org_id)
          .single();
        organization = orgData;
      }

      // Create the client preview data
      const clientPreview: ClientQuotePreview = {
        id: transformedQuote.id,
        inquiryNumber: transformedQuote.inquiry_id || 'N/A',
        client: transformedQuote.client,
        destination: transformedQuote.destination,
        packageName: transformedQuote.package_name || `${transformedQuote.destination} Package`,
        startDate: transformedQuote.start_date,
        endDate: transformedQuote.end_date,
        duration: {
          days: transformedQuote.duration_days,
          nights: transformedQuote.duration_nights
        },
        travelers: {
          adults: transformedQuote.adults,
          childrenWithBed: transformedQuote.children_with_bed,
          childrenNoBed: transformedQuote.children_no_bed,
          infants: transformedQuote.infants
        },
        tourType: transformedQuote.tour_type,
        createdAt: transformedQuote.created_at || new Date().toISOString(),
        hotels: [], // Will be populated if needed
        hotelOptions,
        totalCost: calculations.grand_total,
        currency: transformedQuote.currency_code || 'KES'
      };

      console.log('[QuotePreviewService] Preview generated successfully:', clientPreview);
      return clientPreview;

    } catch (error) {
      console.error('[QuotePreviewService] Error generating preview:', error);
      return null;
    }
  }

  private parseJsonField(field: any, defaultValue: any) {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return defaultValue;
      }
    }
    return Array.isArray(field) || typeof field === 'object' ? field : defaultValue;
  }

  private calculateTotals(quote: QuoteData) {
    const accommodation_total = quote.room_arrangements?.reduce((sum, arr) => sum + (arr.total || 0), 0) || 0;
    const transport_total = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
    const transfer_total = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
    const activity_total = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;

    const subtotal = accommodation_total + transport_total + transfer_total + activity_total;

    // Calculate markup
    let markup_amount = 0;
    if (quote.markup_type === 'percentage') {
      markup_amount = (subtotal * (quote.markup_value || 0)) / 100;
    } else {
      markup_amount = quote.markup_value || 0;
    }

    const grand_total = subtotal + markup_amount;

    return {
      accommodation_total,
      transport_total,
      transfer_total,
      activity_total,
      subtotal,
      markup_amount,
      grand_total
    };
  }
}

export const quotePreviewService = new QuotePreviewService();
