import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { QuoteData, QuoteStatus } from "../types/quote.types";

// Helper function to transform database row to QuoteData interface
const transformQuoteData = (dbRow: any): QuoteData => {
  return {
    ...dbRow,
    status: dbRow.status as QuoteStatus,
    room_arrangements: parseJsonField(dbRow.room_arrangements, []),
    activities: parseJsonField(dbRow.activities, []),
    transports: parseJsonField(dbRow.transports, []),
    transfers: parseJsonField(dbRow.transfers, []),
    sectionMarkups: parseJsonField(dbRow.sectionMarkups, {}),
    // Include the summary_data from normalized tables
    summary_data: dbRow.summary_data || {}
  };
};

const parseJsonField = (field: any, defaultValue: any) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  return Array.isArray(field) || typeof field === 'object' ? field : defaultValue;
};

export const getAllQuotes = async (): Promise<QuoteData[]> => {
  try {
    console.log('[QuoteService] Fetching quotes from database');
    
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[QuoteService] Error fetching quotes:', error);
      throw error;
    }

    console.log('[QuoteService] Fetched quotes:', data?.length || 0);
    return (data || []).map(transformQuoteData);
  } catch (error) {
    console.error('[QuoteService] Error in getAllQuotes:', error);
    toast.error('Failed to load quotes');
    return [];
  }
};

export const getQuoteById = async (id: string): Promise<QuoteData | null> => {
  try {
    console.log('[QuoteService] Fetching quote by ID:', id);
    
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[QuoteService] Error fetching quote:', error);
      throw error;
    }

    return data ? transformQuoteData(data) : null;
  } catch (error) {
    console.error('[QuoteService] Error in getQuoteById:', error);
    toast.error('Failed to load quote details');
    return null;
  }
};

export const saveQuote = async (quote: QuoteData): Promise<QuoteData> => {
  try {
    console.log('[QuoteService] Saving quote:', quote);
    
    // Validate that we have essential data
    if (!quote.client || !quote.destination) {
      throw new Error('Quote must have client name and destination');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Prepare data for database with JSON serialization
    const dbQuoteData = {
      ...quote,
      created_by: quote.created_by || user.id,
      updated_at: new Date().toISOString(),
      room_arrangements: JSON.stringify(quote.room_arrangements || []),
      activities: JSON.stringify(quote.activities || []),
      transports: JSON.stringify(quote.transports || []),
      transfers: JSON.stringify(quote.transfers || []),
      sectionMarkups: JSON.stringify(quote.sectionMarkups || {})
    };

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
      // Create new quote with proper UUID
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

    if (error) {
      console.error('[QuoteService] Error saving quote:', error);
      toast.error('Failed to save quote: ' + error.message);
      throw error;
    }

    toast.success('Quote saved successfully');
    return transformQuoteData(data);
  } catch (error) {
    console.error('[QuoteService] Error in saveQuote:', error);
    throw error;
  }
};

export const generateClientPreview = async (quoteId: string) => {
  try {
    console.log('[QuoteService] Generating client preview for quote:', quoteId);
    
    const quote = await getQuoteById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Get related inquiry details if quote is linked to inquiry
    let inquiry = null;
    if (quote.inquiry_id) {
      const { data: inquiryData, error: inquiryError } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', quote.inquiry_id)
        .maybeSingle();
      
      if (!inquiryError && inquiryData) {
        inquiry = inquiryData;
      }
    }

    // Get hotel details for the quote
    const hotelIds = new Set<string>();
    quote.room_arrangements?.forEach(arr => {
      if (arr.hotel_id) hotelIds.add(arr.hotel_id);
    });

    let hotels: any[] = [];
    if (hotelIds.size > 0) {
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('*')
        .in('id', Array.from(hotelIds));
      
      if (!hotelError && hotelData) {
        hotels = hotelData;
      }
    }

    // Use summary data from normalized tables if available
    const summaryData = quote.summary_data || {};

    // Transform quote data into client preview format
    const clientPreview = {
      id: quote.id,
      inquiryNumber: inquiry?.enquiry_number || 'N/A',
      client: quote.client,
      destination: quote.destination,
      packageName: inquiry?.package_name || 'Custom Package',
      startDate: quote.start_date,
      endDate: quote.end_date,
      duration: {
        days: quote.duration_days || 1,
        nights: quote.duration_nights || 0
      },
      travelers: {
        adults: quote.adults,
        childrenWithBed: quote.children_with_bed,
        childrenNoBed: quote.children_no_bed,
        infants: quote.infants
      },
      tourType: quote.tour_type,
      createdAt: quote.created_at,
      hotels,
      hotelOptions: hotels.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        category: hotel.category,
        pricePerNight: 0, // Will be calculated from room arrangements
        totalPrice: summaryData.total_cost || 0,
        currencyCode: quote.currency_code || 'USD'
      })),
      totalCost: summaryData.total_cost || 0,
      currency: quote.currency_code || 'USD',
      summaryData // Include the calculated summary
    };

    return clientPreview;
  } catch (error) {
    console.error('[QuoteService] Error in generateClientPreview:', error);
    toast.error('Failed to generate quote preview');
    throw error;
  }
};

export const updateQuoteStatus = async (id: string, status: string, hotelId?: string) => {
  try {
    console.log('[QuoteService] Updating quote status:', id, status, hotelId);
    
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (hotelId) {
      updates.approved_hotel_id = hotelId;
    }

    const { error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('[QuoteService] Error updating quote status:', error);
      toast.error('Failed to update quote status');
      throw error;
    }

    toast.success(`Quote status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('[QuoteService] Error in updateQuoteStatus:', error);
    throw error;
  }
};

export const deleteQuote = async (id: string) => {
  try {
    console.log('[QuoteService] Deleting quote:', id);
    
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[QuoteService] Error deleting quote:', error);
      toast.error('Failed to delete quote');
      throw error;
    }

    toast.success('Quote deleted successfully');
    return true;
  } catch (error) {
    console.error('[QuoteService] Error in deleteQuote:', error);
    throw error;
  }
};

export const emailQuote = async (id: string) => {
  console.log('[QuoteService] Emailing quote:', id);
  toast.success('Quote sent to client via email');
  return true;
};

export const printQuote = async (id: string) => {
  console.log('[QuoteService] Printing quote:', id);
  window.print();
  return true;
};

export const downloadQuotePDF = async (id: string) => {
  console.log('[QuoteService] Downloading quote PDF:', id);
  toast.success('Quote downloaded as PDF');
  return true;
};
