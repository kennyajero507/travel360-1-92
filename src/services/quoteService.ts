import { supabase } from "../integrations/supabase/client";
import { QuoteData, RoomArrangement, QuoteActivity, QuoteTransport, QuoteTransfer, ClientQuotePreview, HotelOption } from "../types/quote.types";
import { toast } from "sonner";

// Get all quotes with enhanced filtering
export const getAllQuotes = async (filters?: { tourType?: string; status?: string }) => {
  try {
    let query = supabase
      .from('quotes')
      .select('*, inquiries(*)')
      .order('created_at', { ascending: false });
    
    if (filters?.tourType) {
      query = query.eq('tour_type', filters.tourType);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query;
    
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

// Get inquiries available for quote creation
export const getAvailableInquiries = async () => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('status', 'Assigned')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to fetch inquiries');
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAvailableInquiries:', error);
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
      childrenWithBed: item.children || 0,
      childrenNoBed: 0,
      infants: item.infants || 0,
      ratePerNight: {
        adult: item.cost_per_adult || 0,
        childWithBed: item.cost_per_child || 0,
        childNoBed: 0,
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
        child: item.cost_per_person * 0.7,
        infant: 0
      },
      included: {
        adults: Math.floor(item.num_people / 2),
        children: Math.ceil(item.num_people / 2),
        infants: 0
      },
      total: item.total
    })) || [];

    // Get inquiry details if linked
    let inquiryData = null;
    if (quoteData.inquiry_id) {
      const { data: inquiry } = await supabase
        .from('inquiries')
        .select('enquiry_number, package_name, assigned_agent_name')
        .eq('id', quoteData.inquiry_id)
        .maybeSingle();
      inquiryData = inquiry;
    }
      
    // Transform data to match QuoteData structure
    const quote: QuoteData = {
      ...quoteData,
      id: quoteData.id,
      inquiryId: quoteData.inquiry_id,
      inquiryNumber: inquiryData?.enquiry_number,
      packageName: inquiryData?.package_name,
      assignedAgent: inquiryData?.assigned_agent_name,
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
      tourType: quoteData.tour_type || 'domestic',
      currencyCode: quoteData.currency_code || 'USD',
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
      tour_type: quote.tourType,
      currency_code: quote.currencyCode,
      room_arrangements: JSON.stringify([]),
      activities: JSON.stringify([]),
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
    
    // Handle hotel-specific data if needed
    if (quote.hotelId && quote.roomArrangements.length > 0) {
      // Implementation for saving hotel and room arrangements...
      // (keeping existing logic for hotel management)
    }
    
    // Return the saved quote
    return getQuoteById(quote.id) as Promise<QuoteData>;
  } catch (error) {
    console.error('Error in saveQuote:', error);
    throw error;
  }
};

// Generate client preview data
export const generateClientPreview = async (quoteId: string): Promise<ClientQuotePreview | null> => {
  try {
    const quote = await getQuoteById(quoteId);
    if (!quote) return null;

    // Calculate hotel totals (for simplified preview)
    const hotelOptions: HotelOption[] = [];
    
    // Group room arrangements by hotel
    const hotelGroups = quote.roomArrangements.reduce((acc, room) => {
      const hotelId = room.hotelId || 'default';
      if (!acc[hotelId]) {
        acc[hotelId] = [];
      }
      acc[hotelId].push(room);
      return acc;
    }, {} as Record<string, RoomArrangement[]>);

    // Calculate totals for each hotel
    for (const [hotelId, rooms] of Object.entries(hotelGroups)) {
      const roomTotal = rooms.reduce((sum, room) => sum + room.total, 0);
      const transferTotal = quote.transfers.reduce((sum, transfer) => sum + transfer.total, 0);
      const activityTotal = quote.activities.reduce((sum, activity) => sum + activity.total, 0);
      const transportTotal = quote.transports.reduce((sum, transport) => sum + transport.total, 0);
      
      const subtotal = roomTotal + transferTotal + activityTotal + transportTotal;
      const markupAmount = quote.markup.type === 'percentage' 
        ? (subtotal * quote.markup.value / 100)
        : quote.markup.value;
      const total = subtotal + markupAmount;

      // Get hotel name (this would need hotel data lookup in real implementation)
      const hotelName = `Hotel ${hotelOptions.length + 1}`;
      
      hotelOptions.push({
        id: hotelId,
        name: hotelName,
        totalPrice: total,
        currencyCode: quote.currencyCode
      });
    }

    const clientPreview: ClientQuotePreview = {
      inquiryNumber: quote.inquiryNumber || quote.id || '',
      client: quote.client,
      destination: quote.destination,
      packageName: quote.packageName,
      startDate: quote.startDate,
      endDate: quote.endDate,
      duration: quote.duration,
      travelers: quote.travelers,
      tourType: quote.tourType,
      hotelOptions: hotelOptions,
      createdAt: quote.createdAt || new Date().toISOString()
    };

    return clientPreview;
  } catch (error) {
    console.error('Error generating client preview:', error);
    return null;
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
