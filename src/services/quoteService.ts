import { supabase } from "../integrations/supabase/client";
import { QuoteData, RoomArrangement, QuoteActivity, QuoteTransport, QuoteTransfer } from "../types/quote.types";

// Get all quotes
export const getAllQuotes = async () => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
  
  return data || [];
};

// Get quote by ID
export const getQuoteById = async (quoteId: string): Promise<QuoteData | null> => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single();
  
  if (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
  
  // Transform data to match QuoteData structure
  if (data) {
    return {
      ...data,
      id: data.id,
      inquiryId: data.inquiry_id,
      client: data.client,
      mobile: data.mobile,
      destination: data.destination,
      startDate: data.start_date,
      endDate: data.end_date,
      duration: {
        days: data.duration_days,
        nights: data.duration_nights
      },
      travelers: {
        adults: data.adults,
        childrenWithBed: data.children_with_bed,
        childrenNoBed: data.children_no_bed,
        infants: data.infants
      },
      roomArrangements: (typeof data.room_arrangements === 'string'
        ? JSON.parse(data.room_arrangements)
        : data.room_arrangements) as RoomArrangement[],
      activities: (typeof data.activities === 'string'
        ? JSON.parse(data.activities)
        : data.activities) as QuoteActivity[],
      transports: (typeof data.transports === 'string'
        ? JSON.parse(data.transports)
        : data.transports) as QuoteTransport[],
      transfers: (typeof data.transfers === 'string'
        ? JSON.parse(data.transfers)
        : data.transfers) as QuoteTransfer[],
      markup: {
        type: data.markup_type as "percentage" | "fixed",
        value: data.markup_value
      },
      notes: data.notes || "",
      status: data.status as "draft" | "sent" | "approved" | "rejected",
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hotelId: data.hotel_id,
      approvedHotelId: data.approved_hotel_id
    };
  }
  
  return null;
};

// Save or update a quote
export const saveQuote = async (quote: QuoteData): Promise<QuoteData> => {
  // Generate ID if new quote
  if (!quote.id) {
    quote.id = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
  
  // Update timestamps
  quote.updatedAt = new Date().toISOString();
  if (!quote.createdAt) {
    quote.createdAt = quote.updatedAt;
  }
  
  // Ensure the transfers array exists
  if (!quote.transfers) {
    quote.transfers = [];
  }
  
  // Ensure the markup type is one of the allowed values
  if (quote.markup && typeof quote.markup.type === 'string') {
    if (!['percentage', 'fixed'].includes(quote.markup.type)) {
      quote.markup.type = 'percentage';
    }
  }
  
  // Transform the quote data for Supabase schema
  const quoteForDb = {
    id: quote.id,
    inquiry_id: quote.inquiryId,
    client: quote.client,
    mobile: quote.mobile,
    destination: quote.destination,
    start_date: quote.startDate,
    end_date: quote.endDate,
    duration_days: quote.duration.days,
    duration_nights: quote.duration.nights,
    adults: quote.travelers.adults,
    children_with_bed: quote.travelers.childrenWithBed,
    children_no_bed: quote.travelers.childrenNoBed,
    infants: quote.travelers.infants,
    room_arrangements: JSON.stringify(quote.roomArrangements),
    activities: JSON.stringify(quote.activities),
    transports: JSON.stringify(quote.transports),
    transfers: JSON.stringify(quote.transfers),
    markup_type: quote.markup.type,
    markup_value: quote.markup.value,
    notes: quote.notes,
    status: quote.status,
    created_by: quote.createdBy,
    created_at: quote.createdAt,
    updated_at: quote.updatedAt,
    hotel_id: quote.hotelId
  };

  const { data, error } = await supabase
    .from('quotes')
    .upsert(quoteForDb)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving quote:', error);
    throw error;
  }
  
  // If we have room arrangements, save them to the quote_hotels table
  if (quote.roomArrangements.length > 0) {
    // Group room arrangements by hotel
    const hotelGroups = new Map<string, RoomArrangement[]>();
    
    quote.roomArrangements.forEach(arrangement => {
      const hotelId = arrangement.hotelId || 'unknown';
      if (!hotelGroups.has(hotelId)) {
        hotelGroups.set(hotelId, []);
      }
      hotelGroups.get(hotelId)!.push(arrangement);
    });
    
    // For each hotel, save a row in quote_hotels
    // Note: In a real implementation, this would also handle updating existing quote_hotels records
    // and creating/updating related quote_room_arrangements, quote_activities, etc.
    // For now, this is a simplified implementation
    
    // In a production app, we would:
    // 1. Check for existing quote_hotels records and update/create as needed
    // 2. For each quote_hotels record, update/create quote_room_arrangements, quote_activities, etc.
    // 3. Delete any records that no longer exist in the current quote data
  }
  
  // Transform back to QuoteData structure and return
  return getQuoteById(data.id) as Promise<QuoteData>;
};

// Update quote status
export const updateQuoteStatus = async (
  quoteId: string, 
  status: "draft" | "sent" | "approved" | "rejected",
  approvedHotelId?: string
): Promise<boolean> => {
  const updateData: any = { 
    status: status,
    updated_at: new Date().toISOString()
  };
  
  // If approving quote with a specific hotel, include it
  if (status === 'approved' && approvedHotelId) {
    updateData.approved_hotel_id = approvedHotelId;
  }
  
  const { error } = await supabase
    .from('quotes')
    .update(updateData)
    .eq('id', quoteId);
  
  if (error) {
    console.error('Error updating quote status:', error);
    return false;
  }
  
  return true;
};
