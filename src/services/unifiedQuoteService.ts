
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { QuoteData, QuoteStatus } from "../types/quote.types";
import { QuoteSummaryData } from "../types/quoteSummary.types";

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
      toast.error('Failed to load quotes');
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
      toast.error('Failed to load quote details');
      return null;
    }
  }

  async saveQuote(quote: QuoteData): Promise<QuoteData> {
    try {
      console.log('[UnifiedQuoteService] Saving quote:', quote.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
      toast.error('Failed to save quote');
      throw error;
    }
  }

  // Quote package operations using proper database tables
  async createQuotePackage(quotes: QuoteData[], packageName: string): Promise<string> {
    try {
      console.log('[UnifiedQuoteService] Creating quote package with proper database tables');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the quote package
      const { data: packageData, error: packageError } = await supabase
        .from('quote_packages')
        .insert([{
          package_name: packageName,
          client_name: quotes[0]?.client || 'Unknown Client',
          created_by: user.id,
          status: 'draft'
        }])
        .select()
        .single();

      if (packageError) throw packageError;

      // Create package items for each quote
      const packageItems = quotes.map((quote, index) => ({
        package_id: packageData.id,
        quote_id: quote.id,
        option_name: `Option ${index + 1}`
      }));

      const { error: itemsError } = await supabase
        .from('quote_package_items')
        .insert(packageItems);

      if (itemsError) throw itemsError;

      toast.success('Quote package created successfully');
      return packageData.id;
    } catch (error) {
      console.error('[UnifiedQuoteService] Error creating quote package:', error);
      toast.error('Failed to create quote package');
      throw error;
    }
  }

  async getQuotePackage(packageId: string) {
    try {
      console.log('[UnifiedQuoteService] Fetching quote package:', packageId);
      
      // Get package data
      const { data: packageData, error: packageError } = await supabase
        .from('quote_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError) throw packageError;

      // Get package items with quote details
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_package_items')
        .select(`
          *,
          quotes (*)
        `)
        .eq('package_id', packageId);

      if (itemsError) throw itemsError;

      return {
        id: packageData.id,
        package_name: packageData.package_name,
        client_name: packageData.client_name,
        status: packageData.status,
        quotes: itemsData?.map(item => ({
          ...this.transformQuoteData(item.quotes),
          isSelected: item.is_selected,
          option_name: item.option_name
        })) || []
      };
    } catch (error) {
      console.error('[UnifiedQuoteService] Error fetching quote package:', error);
      throw error;
    }
  }

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
      sectionMarkups: this.parseJsonField(dbRow.sectionMarkups, {}),
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
      ...quote,
      created_by: quote.created_by || userId,
      updated_at: new Date().toISOString(),
      room_arrangements: JSON.stringify(quote.room_arrangements || []),
      activities: JSON.stringify(quote.activities || []),
      transports: JSON.stringify(quote.transports || []),
      transfers: JSON.stringify(quote.transfers || []),
      sectionMarkups: JSON.stringify(quote.sectionMarkups || {}),
      summary_data: quote.summary_data ? JSON.stringify(quote.summary_data) : null
    };
  }
}

// Export singleton instance
export const unifiedQuoteService = new UnifiedQuoteService();
