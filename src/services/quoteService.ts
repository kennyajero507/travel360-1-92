
import { supabase } from "../integrations/supabase/client";
import { QuoteData, RoomArrangement, QuoteActivity, QuoteTransport, QuoteTransfer } from "../types/quote.types";
import { toast } from "sonner";

// Get all quotes
export const getAllQuotes = async () => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, inquiries(*)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to fetch quotes');
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllQuotes:', error);
    throw error;
  }
};

// Get quote by ID with proper relationships
export const getQuoteById = async (quoteId: string): Promise<QuoteData | null> => {
  try {
    // Fetch the quote
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .maybeSingle();
    
    if (quoteError) {
      console.error('Error fetching quote:', quoteError);
      toast.error('Failed to fetch quote details');
      throw quoteError;
    }
    
    if (!quoteData) {
      toast.error('Quote not found');
      return null;
    }
    
    // Fetch related room arrangements from proper table
    const { data: roomArrangementsData, error: roomError } = await supabase
      .from('quote_room_arrangements')
      .select('*')
      .eq('quote_hotel_id', quoteData.approved_hotel_id || quoteData.hotel_id)
      .order('id');
      
    // Fetch related activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('quote_activities')
      .select('*')
      .eq('quote_hotel_id', quoteData.approved_hotel_id || quoteData.hotel_id)
      .order('id');
      
    // Transform room arrangements to match our TypeScript type
    const roomArrangements: RoomArrangement[] = roomArrangementsData?.map(item => ({
      id: item.id,
      hotelId: quoteData.approved_hotel_id || quoteData.hotel_id,
      roomType: item.room_type,
      numRooms: item.num_rooms,
      adults: item.adults,
      childrenWithBed: item.children || 0, // Map DB 'children' to our 'childrenWithBed'
      childrenNoBed: 0, // Not stored separately in the DB
      infants: item.infants || 0,
      ratePerNight: {
        adult: item.cost_per_adult || 0,
        childWithBed: item.cost_per_child || 0,
        childNoBed: 0, // Not stored separately in the DB
        infant: item.cost_per_infant || 0
      },
      nights: item.nights,
      total: item.total
    })) || [];

    // Transform activities to match our TypeScript type
    const activities: QuoteActivity[] = activitiesData?.map(item => ({
      id: item.id,
      name: item.title,
      description: item.description || '',
      costPerPerson: {
        adult: item.cost_per_person,
        child: item.cost_per_person * 0.7, // Assuming child cost is 70% of adult cost
        infant: 0
      },
      included: {
        adults: Math.floor(item.num_people / 2), // Rough estimate
        children: Math.ceil(item.num_people / 2), // Rough estimate
        infants: 0
      },
      total: item.total
    })) || [];
      
    // Transform data to match QuoteData structure
    const quote: QuoteData = {
      ...quoteData,
      id: quoteData.id,
      inquiryId: quoteData.inquiry_id,
      client: quoteData.client,
      mobile: quoteData.mobile,
      destination: quoteData.destination,
      startDate: quoteData.start_date,
      endDate: quoteData.end_date,
      duration: {
        days: quoteData.duration_days,
        nights: quoteData.duration_nights
      },
      travelers: {
        adults: quoteData.adults,
        childrenWithBed: quoteData.children_with_bed,
        childrenNoBed: quoteData.children_no_bed,
        infants: quoteData.infants
      },
      roomArrangements: roomArrangements,
      activities: activities,
      transports: (typeof quoteData.transports === 'string'
        ? JSON.parse(quoteData.transports)
        : quoteData.transports) as QuoteTransport[],
      transfers: (typeof quoteData.transfers === 'string'
        ? JSON.parse(quoteData.transfers)
        : quoteData.transfers) as QuoteTransfer[],
      markup: {
        type: quoteData.markup_type as "percentage" | "fixed",
        value: quoteData.markup_value
      },
      notes: quoteData.notes || "",
      status: quoteData.status as "draft" | "sent" | "approved" | "rejected",
      createdBy: quoteData.created_by,
      createdAt: quoteData.created_at,
      updatedAt: quoteData.updated_at,
      hotelId: quoteData.hotel_id,
      approvedHotelId: quoteData.approved_hotel_id
    };
    
    return quote;
  } catch (error) {
    console.error('Error in getQuoteById:', error);
    return null;
  }
};

// Save or update a quote with proper relationships
export const saveQuote = async (quote: QuoteData): Promise<QuoteData> => {
  try {
    // Generate ID if new quote
    if (!quote.id) {
      quote.id = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
    
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    // Update timestamps
    quote.updatedAt = new Date().toISOString();
    if (!quote.createdAt) {
      quote.createdAt = quote.updatedAt;
    }
    
    // If no creator is set and we have a logged-in user
    if (!quote.createdBy && user) {
      quote.createdBy = user.id;
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
      room_arrangements: JSON.stringify([]), // We'll store room arrangements separately
      activities: JSON.stringify([]), // We'll store activities separately
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

    // First, save the main quote to get its ID
    const { data: savedQuote, error: quoteError } = await supabase
      .from('quotes')
      .upsert(quoteForDb)
      .select()
      .single();
    
    if (quoteError) {
      console.error('Error saving quote:', quoteError);
      toast.error('Failed to save quote');
      throw quoteError;
    }
    
    // If we have a selected hotel, save it to the quote_hotels table
    if (quote.hotelId) {
      // Check if a hotel record already exists
      const { data: existingHotels } = await supabase
        .from('quote_hotels')
        .select('*')
        .eq('quote_id', quote.id);
      
      // Create hotel entry if it doesn't exist
      if (!existingHotels || existingHotels.length === 0) {
        const { error: hotelError } = await supabase
          .from('quote_hotels')
          .insert({
            quote_id: quote.id,
            hotel_id: quote.hotelId,
            hotel_name: 'Hotel Name', // This should ideally come from your hotel data
            markup_percent: quote.markup.value
          });
          
        if (hotelError) {
          console.error('Error adding hotel to quote:', hotelError);
          toast.error('Failed to save hotel details');
        }
      }
      
      // For each room arrangement, save to the quote_room_arrangements table
      if (quote.roomArrangements && quote.roomArrangements.length > 0) {
        // Get the quote_hotel_id
        const { data: hotelData } = await supabase
          .from('quote_hotels')
          .select('id')
          .eq('quote_id', quote.id)
          .single();
          
        if (hotelData) {
          // Delete existing room arrangements
          await supabase
            .from('quote_room_arrangements')
            .delete()
            .eq('quote_hotel_id', hotelData.id);
          
          // Insert new room arrangements
          for (const arrangement of quote.roomArrangements) {
            const roomArrangementData = {
              quote_hotel_id: hotelData.id,
              room_type: arrangement.roomType,
              adults: arrangement.adults,
              children: arrangement.childrenWithBed + arrangement.childrenNoBed, // Combine children types for DB
              infants: arrangement.infants || 0,
              num_rooms: arrangement.numRooms,
              nights: quote.duration.nights,
              cost_per_adult: arrangement.ratePerNight.adult,
              cost_per_child: arrangement.ratePerNight.childWithBed, // Use childWithBed rate for DB
              cost_per_infant: arrangement.ratePerNight.infant || 0,
              total: arrangement.total || 0
            };
            
            await supabase
              .from('quote_room_arrangements')
              .insert(roomArrangementData);
          }
        }
      }
    }
    
    // Return the saved quote
    return getQuoteById(quote.id) as Promise<QuoteData>;
  } catch (error) {
    console.error('Error in saveQuote:', error);
    throw error;
  }
};

// Update quote status
export const updateQuoteStatus = async (
  quoteId: string, 
  status: "draft" | "sent" | "approved" | "rejected",
  approvedHotelId?: string
): Promise<boolean> => {
  try {
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
      toast.error('Failed to update quote status');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateQuoteStatus:', error);
    return false;
  }
};
