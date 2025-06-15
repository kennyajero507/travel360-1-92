
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { QuoteData, QuoteStatus, QuoteValidation, QuoteCalculations } from "../types/quote.types";

class EnhancedQuoteService {
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private pendingChanges: Map<string, QuoteData> = new Map();

  // Auto-save functionality
  enableAutoSave(quoteId: string, quote: QuoteData, intervalMs: number = 30000) {
    this.pendingChanges.set(quoteId, quote);
    
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(async () => {
      const pendingQuote = this.pendingChanges.get(quoteId);
      if (pendingQuote) {
        try {
          await this.saveQuote(pendingQuote);
          console.log(`[AutoSave] Quote ${quoteId} saved automatically`);
        } catch (error) {
          console.error(`[AutoSave] Failed to save quote ${quoteId}:`, error);
        }
      }
    }, intervalMs);
  }

  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    this.pendingChanges.clear();
  }

  // Transform database row to QuoteData interface
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

  // Enhanced save with validation and error handling
  async saveQuote(quote: QuoteData): Promise<QuoteData> {
    try {
      console.log('[EnhancedQuoteService] Attempting to save quote:', quote);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const authError = new Error('User not authenticated');
        authError.name = 'AuthenticationError';
        throw authError;
      }

      // Validate quote before saving
      const validation = this.validateQuote(quote);
      if (!validation.isValid && validation.errors.length > 0) {
        console.warn('[EnhancedQuoteService] Quote has validation warnings:', validation.warnings);
      }

      const isNewQuote = !quote.id || quote.id.startsWith('quote-');
      console.log('[EnhancedQuoteService] Is new quote?', isNewQuote);

      // Prepare data for database with proper JSON serialization
      const dbQuoteData: any = {
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
        created_by: user.id,
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
        updated_at: new Date().toISOString()
      };

      let data, error;

      if (isNewQuote) {
        // Create new quote, letting the DB generate the ID
        console.log('[EnhancedQuoteService] Creating new quote in DB with data:', dbQuoteData);
        dbQuoteData.created_at = new Date().toISOString();
        
        ({ data, error } = await supabase
          .from('quotes')
          .insert([dbQuoteData])
          .select()
          .single());
      } else {
        // Update existing quote
        console.log(`[EnhancedQuoteService] Updating quote ${quote.id} with data:`, dbQuoteData);
        ({ data, error } = await supabase
          .from('quotes')
          .update(dbQuoteData)
          .eq('id', quote.id)
          .select()
          .single());
      }

      if (error) {
        console.error('[EnhancedQuoteService] Error saving quote to Supabase:', error);
        toast.error('Failed to save quote: ' + error.message);
        throw error;
      }

      // Remove from pending changes after successful save
      this.pendingChanges.delete(quote.id);
      
      const savedQuote = this.transformQuoteData(data);
      console.log('[EnhancedQuoteService] Quote saved successfully:', savedQuote);
      toast.success('Quote saved successfully');
      return savedQuote;
    } catch (error) {
      console.error('[EnhancedQuoteService] Critical error in saveQuote:', error);
      // Avoid re-toasting if already handled by specific logic
      if (!(error instanceof Error && (error.message.includes('User not authenticated') || error.message.includes('Failed to save quote')))) {
        toast.error('An unexpected error occurred while saving the quote.');
      }
      throw error;
    }
  }

  // Enhanced quote retrieval
  async getQuoteById(id: string): Promise<QuoteData | null> {
    try {
      console.log('[EnhancedQuoteService] Fetching quote by ID:', id);
      
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[EnhancedQuoteService] Error fetching quote:', error);
        throw error;
      }

      if (!data) {
        console.warn('[EnhancedQuoteService] Quote not found:', id);
        return null;
      }

      return this.transformQuoteData(data);
    } catch (error) {
      console.error('[EnhancedQuoteService] Error in getQuoteById:', error);
      toast.error('Failed to load quote details');
      return null;
    }
  }

  // Quote validation
  validateQuote(quote: QuoteData): QuoteValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let completionPercentage = 0;
    const totalSections = quote.tour_type === 'international' ? 8 : 7;
    let completedSections = 0;

    // Basic information validation
    if (!quote.client?.trim()) errors.push('Client name is required');
    if (!quote.mobile?.trim()) errors.push('Mobile number is required');
    if (!quote.destination?.trim()) errors.push('Destination is required');
    if (!quote.start_date) errors.push('Start date is required');
    if (!quote.end_date) errors.push('End date is required');
    
    // Date validation
    if (quote.start_date && quote.end_date) {
      const startDate = new Date(quote.start_date);
      const endDate = new Date(quote.end_date);
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    // Section completion checks
    if (quote.room_arrangements && quote.room_arrangements.length > 0) {
      completedSections++;
      if (quote.room_arrangements.some(arr => arr.total <= 0)) {
        warnings.push('Some room arrangements have zero or negative costs');
      }
    }

    if (quote.transports && quote.transports.length > 0) completedSections++;
    if (quote.transfers && quote.transfers.length > 0) completedSections++;
    if (quote.activities && quote.activities.length > 0) completedSections++;
    if (quote.itinerary && quote.itinerary.length > 0) completedSections++;
    if (quote.sectionMarkups && Object.keys(quote.sectionMarkups).length > 0) completedSections++;

    // International-specific validations
    if (quote.tour_type === 'international') {
      if (quote.visa_documentation && quote.visa_documentation.length > 0) {
        completedSections++;
      }
      
      if (quote.visa_required && !quote.passport_expiry_date) {
        warnings.push('Passport expiry date is recommended when visa is required');
      }
      
      if (!quote.travel_insurance_required) {
        warnings.push('Consider recommending travel insurance for international tours');
      }
    }

    // Summary section is always available
    completedSections++;

    completionPercentage = (completedSections / totalSections) * 100;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completionPercentage
    };
  }

  // Calculate quote totals
  calculateQuoteTotals(quote: QuoteData): QuoteCalculations {
    const accommodation_subtotal = quote.room_arrangements?.reduce((sum, arr) => sum + (arr.total || 0), 0) || 0;
    const transport_subtotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
    const transfer_subtotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
    const excursion_subtotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;
    const visa_documentation_subtotal = quote.visa_documentation?.reduce((sum, doc) => sum + (doc.cost || 0), 0) || 0;

    const subtotal = accommodation_subtotal + transport_subtotal + transfer_subtotal + excursion_subtotal + visa_documentation_subtotal;

    // Calculate markup
    let markup_amount = 0;
    if (quote.markup_type === 'percentage') {
      markup_amount = (subtotal * (quote.markup_value || 0)) / 100;
    } else {
      markup_amount = quote.markup_value || 0;
    }

    // Calculate section-specific markups
    const section_markups: Record<string, number> = {};
    if (quote.sectionMarkups) {
      Object.entries(quote.sectionMarkups).forEach(([section, markup]) => {
        const sectionSubtotal = section === 'accommodation' ? accommodation_subtotal :
                               section === 'transport' ? transport_subtotal :
                               section === 'transfer' ? transfer_subtotal :
                               section === 'excursion' ? excursion_subtotal :
                               section === 'visa_documentation' ? visa_documentation_subtotal : 0;
        
        if (markup.type === 'percentage') {
          section_markups[section] = (sectionSubtotal * markup.value) / 100;
        } else {
          section_markups[section] = markup.value;
        }
      });
    }

    const total_markup = markup_amount + Object.values(section_markups).reduce((sum, val) => sum + val, 0);
    const total_amount = subtotal + total_markup;
    
    const totalTravelers = quote.adults + quote.children_with_bed + quote.children_no_bed;
    const per_person_cost = totalTravelers > 0 ? total_amount / totalTravelers : 0;

    return {
      accommodation_subtotal,
      transport_subtotal,
      transfer_subtotal,
      excursion_subtotal,
      visa_documentation_subtotal,
      subtotal,
      markup_amount: total_markup,
      total_amount,
      per_person_cost,
      section_markups
    };
  }

  // Update pending changes for auto-save
  updatePendingChanges(quoteId: string, quote: QuoteData) {
    this.pendingChanges.set(quoteId, quote);
  }
}

export const enhancedQuoteService = new EnhancedQuoteService();
