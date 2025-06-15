
import { supabase } from "../../integrations/supabase/client";
import { QuoteData, QuoteStatus } from "../../types/quote.types";
import { toast } from "sonner";

export const parseJsonField = (field: any, defaultValue: any) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  return Array.isArray(field) || typeof field === 'object' ? field : defaultValue;
};

export const transformQuoteData = (dbRow: any): QuoteData => {
  return {
    ...dbRow,
    status: dbRow.status as QuoteStatus,
    room_arrangements: parseJsonField(dbRow.room_arrangements, []),
    activities: parseJsonField(dbRow.activities, []),
    transports: parseJsonField(dbRow.transports, []),
    transfers: parseJsonField(dbRow.transfers, []),
    sectionMarkups: parseJsonField(dbRow.sectionMarkups, {})
  };
};

export const getAllQuotes = async (): Promise<QuoteData[]> => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(transformQuoteData);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    toast.error('Failed to fetch quotes');
    return [];
  }
};

export const getQuoteById = async (id: string): Promise<QuoteData | null> => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    return data ? transformQuoteData(data) : null;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
};

export const updateQuoteStatus = async (quoteId: string, status: QuoteStatus, approvedHotelId?: string): Promise<void> => {
  try {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (approvedHotelId) {
      updateData.approved_hotel_id = approvedHotelId;
    }

    const { error } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', quoteId);

    if (error) throw error;
    
    toast.success(`Quote status updated to ${status}`);
  } catch (error) {
    console.error('Error updating quote status:', error);
    toast.error('Failed to update quote status');
    throw error;
  }
};

export const deleteQuote = async (quoteId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', quoteId);

    if (error) throw error;
    
    toast.success('Quote deleted successfully');
  } catch (error) {
    console.error('Error deleting quote:', error);
    toast.error('Failed to delete quote');
    throw error;
  }
};
