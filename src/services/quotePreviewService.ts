
import { supabase } from '../integrations/supabase/client';
import { QuoteData } from '../types/quote.types';

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
  async generateClientPreview(quoteId: string): Promise<QuotePreviewData | null> {
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

      // Transform the quote data
      const transformedQuote: QuoteData = {
        ...quote,
        room_arrangements: this.parseJsonField(quote.room_arrangements, []),
        activities: this.parseJsonField(quote.activities, []),
        transports: this.parseJsonField(quote.transports, []),
        transfers: this.parseJsonField(quote.transfers, []),
        sectionMarkups: this.parseJsonField(quote.sectionmarkups, {}),
        visa_documentation: this.parseJsonField(quote.visa_documentation, []),
        document_checklist: this.parseJsonField(quote.document_checklist, []),
        itinerary: this.parseJsonField(quote.itinerary, [])
      };

      // Calculate totals
      const calculations = this.calculateTotals(transformedQuote);

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

      const previewData: QuotePreviewData = {
        quote: transformedQuote,
        organization,
        calculations
      };

      console.log('[QuotePreviewService] Preview generated successfully:', previewData);
      return previewData;

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
