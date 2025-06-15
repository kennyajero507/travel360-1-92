
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { QuoteData, QuoteStatus } from "../types/quote.types";
import { QuoteSummaryData } from "../types/quoteSummary.types";
import { errorHandler } from "./errorHandlingService";

// Unified Quote Service that combines functionality from multiple services
export class UnifiedQuoteService {
  
  // Core quote operations
  async getAllQuotes(): Promise<QuoteData[]> {
    try {
      console.log('[UnifiedQuoteService] Fetching all quotes');
      
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(this.transformQuoteData);
    } catch (error) {
      console.error('[UnifiedQuoteService] Error fetching quotes:', error);
      errorHandler.handleError(error, 'getAllQuotes');
      return [];
    }
  }

  async getQuoteById(id: string): Promise<QuoteData | null> {
    try {
      console.log('[UnifiedQuoteService] Fetching quote by ID:', id);
      
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      return data ? this.transformQuoteData(data) : null;
    } catch (error) {
      console.error('[UnifiedQuoteService] Error fetching quote:', error);
      errorHandler.handleError(error, 'getQuoteById');
      return null;
    }
  }

  async saveQuote(quote: QuoteData): Promise<QuoteData> {
    try {
      console.log('[UnifiedQuoteService] Saving quote:', quote.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const authError = new Error('User not authenticated');
        authError.name = 'AuthenticationError';
        throw authError;
      }

      const dbQuoteData = this.prepareQuoteForDatabase(quote, user.id);
      
      let data, error;

      if (quote.id && !quote.id.startsWith('quote-')) {
        // Update existing quote
        ({ data, error } = await supabase
          .from('quotes')
          .update(dbQuoteData)
          .eq('id', quote.id)
          .select()
          .single());
      } else {
        // Create new quote
        const newQuote = {
          ...dbQuoteData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        };
        
        ({ data, error } = await supabase
          .from('quotes')
          .insert([newQuote])
          .select()
          .single());
      }

      if (error) throw error;
      
      toast.success('Quote saved successfully');
      return this.transformQuoteData(data);
    } catch (error) {
      console.error('[UnifiedQuoteService] Error saving quote:', error);
      errorHandler.handleError(error, 'saveQuote');
      throw error;
    }
  }

  // --- Disabled quote package logic due to missing tables ---
  // async createQuotePackage(quotes: QuoteData[], packageName: string): Promise<string> {
  //   throw new Error("Quote package feature is not available: missing database tables.");
  // }
  // async getQuotePackage(packageId: string) {
  //   throw new Error("Quote package feature is not available: missing database tables.");
  // }
  // --- End disabled logic ---

  // Real-time summary calculation
  async calculateQuoteSummary(quoteId: string): Promise<QuoteSummaryData> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_quote_summary', { quote_id_param: quoteId });

      if (error) throw error;
      
      // Type guard and safe casting for summary data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const summaryData = data as { [key: string]: any };
        
        // Validate that we have the expected structure
        if (typeof summaryData.number_of_adults === 'number' &&
            typeof summaryData.accommodation_cost === 'number' &&
            typeof summaryData.total_cost === 'number') {
          return summaryData as QuoteSummaryData;
        }
      }
      
      throw new Error('Invalid summary data returned from database');
    } catch (error) {
      console.error('[UnifiedQuoteService] Error calculating summary:', error);
      errorHandler.handleError(error, 'calculateQuoteSummary');
      throw error;
    }
  }

  // Helper methods
  private transformQuoteData(dbRow: any): QuoteData {
    return {
      ...dbRow,
      status: dbRow.status as QuoteStatus,
      room_arrangements: this.parseJsonField(dbRow.room_arrangements, []),
      activities: this.parseJsonField(dbRow.activities, []),
      transports: this.parseJsonField(dbRow.transports, []),
      transfers: this.parseJsonField(dbRow.transfers, []),
      sectionMarkups: this.parseJsonField(dbRow.sectionmarkups, {}),
      visa_documentation: this.parseJsonField(dbRow.visa_documentation, []),
      document_checklist: this.parseJsonField(dbRow.document_checklist, []),
      itinerary: this.parseJsonField(dbRow.itinerary, []),
      summary_data: this.parseJsonField(dbRow.summary_data, {})
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

  private prepareQuoteForDatabase(quote: QuoteData, userId: string) {
    return {
      inquiry_id: quote.inquiry_id || null,
      client: quote.client,
      mobile: quote.mobile,
      client_email: quote.client_email || null,
      destination: quote.destination,
      start_date: quote.start_date,
      end_date: quote.end_date,
      duration_days: quote.duration_days,
      duration_nights: quote.duration_nights,
      adults: quote.adults,
      children_with_bed: quote.children_with_bed,
      children_no_bed: quote.children_no_bed,
      infants: quote.infants,
      tour_type: quote.tour_type,
      status: quote.status,
      notes: quote.notes || null,
      created_by: quote.created_by || userId,
      hotel_id: quote.hotel_id || null,
      currency_code: quote.currency_code,
      markup_type: quote.markup_type,
      markup_value: quote.markup_value,
      room_arrangements: JSON.stringify(quote.room_arrangements || []),
      activities: JSON.stringify(quote.activities || []),
      transports: JSON.stringify(quote.transports || []),
      transfers: JSON.stringify(quote.transfers || []),
      sectionmarkups: JSON.stringify(quote.sectionMarkups || {}),
      
      // Enhanced international fields
      visa_required: quote.visa_required || false,
      passport_expiry_date: quote.passport_expiry_date || null,
      preferred_currency: quote.preferred_currency || null,
      flight_preference: quote.flight_preference || null,
      travel_insurance_required: quote.travel_insurance_required || false,
      visa_documentation: JSON.stringify(quote.visa_documentation || []),
      
      // Enhanced domestic fields
      regional_preference: quote.regional_preference || null,
      transport_mode_preference: quote.transport_mode_preference || null,
      guide_language_preference: quote.guide_language_preference || null,
      
      // Enhanced common fields
      estimated_budget_range: quote.estimated_budget_range || null,
      special_requirements: quote.special_requirements || null,
      document_checklist: JSON.stringify(quote.document_checklist || []),
      workflow_stage: quote.workflow_stage || 'initial',
      
      // Itinerary
      itinerary: JSON.stringify(quote.itinerary || []),
      updated_at: new Date().toISOString(),
      summary_data: quote.summary_data ? JSON.stringify(quote.summary_data) : null
    };
  }
}

// Export singleton instance
export const unifiedQuoteService = new UnifiedQuoteService();
