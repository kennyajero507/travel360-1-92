
import { supabase } from '../integrations/supabase/client';
import { QuoteData } from '../types/quote.types';
import { ClientQuotePreview } from '../types/quote.types';
import { currencyService } from './currencyService';

export class QuotePreviewService {
  
  async generateClientPreview(quoteId: string): Promise<ClientQuotePreview | null> {
    try {
      console.log('[QuotePreviewService] Generating preview for quote:', quoteId);
      
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .maybeSingle();

      if (error) {
        console.error('[QuotePreviewService] Error fetching quote:', error);
        throw error;
      }

      if (!quote) {
        console.warn('[QuotePreviewService] Quote not found:', quoteId);
        return null;
      }

      // Transform quote data
      const transformedQuote = this.transformQuoteData(quote);
      
      // Get hotel information if available
      let hotels = [];
      if (transformedQuote.room_arrangements && transformedQuote.room_arrangements.length > 0) {
        const hotelIds = [...new Set(transformedQuote.room_arrangements
          .map(arr => arr.hotel_id)
          .filter(Boolean))];
        
        if (hotelIds.length > 0) {
          const { data: hotelData } = await supabase
            .from('hotels')
            .select('*')
            .in('id', hotelIds);
          
          hotels = hotelData || [];
        }
      }

      // Calculate totals
      const totals = this.calculateQuoteTotals(transformedQuote);

      const clientPreview: ClientQuotePreview = {
        id: transformedQuote.id,
        inquiryNumber: transformedQuote.inquiry_id || `Q-${transformedQuote.id.slice(0, 8)}`,
        client: transformedQuote.client,
        destination: transformedQuote.destination,
        packageName: `${transformedQuote.destination} Package`,
        startDate: transformedQuote.start_date,
        endDate: transformedQuote.end_date,
        duration: {
          days: transformedQuote.duration_days,
          nights: transformedQuote.duration_nights
        },
        travelers: {
          adults: transformedQuote.adults,
          childrenWithBed: transformedQuote.children_with_bed || 0,
          childrenNoBed: transformedQuote.children_no_bed || 0,
          infants: transformedQuote.infants || 0
        },
        tourType: transformedQuote.tour_type || 'domestic',
        createdAt: transformedQuote.created_at || new Date().toISOString(),
        hotels: hotels.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          category: hotel.category,
          location: hotel.location,
          description: hotel.description,
          amenities: hotel.amenities || [],
          images: hotel.images || [],
          roomTypes: hotel.room_types || [],
          destination: hotel.destination || '',
          status: hotel.status || 'Active'
        })),
        hotelOptions: hotels.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          category: hotel.category,
          pricePerNight: 0, // Will be calculated from room arrangements
          totalPrice: totals.grandTotal,
          currencyCode: transformedQuote.currency_code || 'KES',
          selected: false
        })),
        totalCost: totals.grandTotal,
        currency: transformedQuote.currency_code || 'KES'
      };

      console.log('[QuotePreviewService] Generated preview:', clientPreview);
      return clientPreview;
    } catch (error) {
      console.error('[QuotePreviewService] Error generating preview:', error);
      return null;
    }
  }

  private transformQuoteData(dbRow: any): QuoteData {
    return {
      ...dbRow,
      room_arrangements: this.parseJsonField(dbRow.room_arrangements, []),
      activities: this.parseJsonField(dbRow.activities, []),
      transports: this.parseJsonField(dbRow.transports, []),
      transfers: this.parseJsonField(dbRow.transfers, []),
      sectionMarkups: this.parseJsonField(dbRow.sectionmarkups, {}),
      visa_documentation: this.parseJsonField(dbRow.visa_documentation, []),
      document_checklist: this.parseJsonField(dbRow.document_checklist, []),
      itinerary: this.parseJsonField(dbRow.itinerary, [])
    };
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

  private calculateQuoteTotals(quote: QuoteData) {
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
    
    const grandTotal = subtotal + markupAmount;

    return {
      accommodation: accommodationTotal,
      transport: transportTotal,
      transfer: transferTotal,
      activity: activityTotal,
      subtotal,
      markup: markupAmount,
      grandTotal
    };
  }

  formatAmountWithCurrency(amount: number, currencyCode: string): string {
    return currencyService.formatAmount(amount, currencyCode);
  }
}

export const quotePreviewService = new QuotePreviewService();
