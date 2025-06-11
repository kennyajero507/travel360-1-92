
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

  // Quote package operations for multi-quote client selection
  async createQuotePackage(quotes: QuoteData[], packageName: string): Promise<string> {
    try {
      console.log('[UnifiedQuoteService] Creating quote package');
      
      const packageData = {
        package_name: packageName,
        client_name: quotes[0]?.client || '',
        status: 'draft',
        created_at: new Date().toISOString()
      };

      const { data: packageResult, error: packageError } = await supabase
        .from('quote_packages')
        .insert([packageData])
        .select()
        .single();

      if (packageError) throw packageError;

      // Link quotes to package
      const quoteLinks = quotes.map(quote => ({
        package_id: packageResult.id,
        quote_id: quote.id,
        is_selected: false
      }));

      const { error: linkError } = await supabase
        .from('quote_package_items')
        .insert(quoteLinks);

      if (linkError) throw linkError;

      toast.success('Quote package created successfully');
      return packageResult.id;
    } catch (error) {
      console.error('[UnifiedQuoteService] Error creating quote package:', error);
      toast.error('Failed to create quote package');
      throw error;
    }
  }

  async getQuotePackage(packageId: string) {
    try {
      const { data, error } = await supabase
        .from('quote_packages')
        .select(`
          *,
          quote_package_items (
            quote_id,
            is_selected,
            quotes (*)
          )
        `)
        .eq('id', packageId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        quotes: data.quote_package_items.map((item: any) => ({
          ...this.transformQuoteData(item.quotes),
          isSelected: item.is_selected
        }))
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
      
      return data as QuoteSummaryData;
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
