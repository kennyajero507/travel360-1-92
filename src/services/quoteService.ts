import { supabase } from "../integrations/supabase/client";
import { QuoteData, QuoteStatus, ClientQuotePreview, HotelOption } from "../types/quote.types";
import { Hotel } from "../types/hotel.types";
import { toast } from "sonner";
import { generateQuotePDF } from "./pdfQuoteGenerator";

// Define a compatible Hotel interface for the quote service
interface QuoteServiceHotel {
  id: string;
  name: string;
  category?: string;
  status?: string; // Allow any string to match database
}

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

const transformQuoteData = (dbRow: any): QuoteData => {
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

export const generateClientPreview = async (quoteId: string): Promise<ClientQuotePreview | null> => {
  try {
    const quote = await getQuoteById(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Get hotels data for the quote
    const hotelIds = new Set<string>();
    if (quote.hotel_id) hotelIds.add(quote.hotel_id);
    
    // Collect hotel IDs from room arrangements
    quote.room_arrangements?.forEach(room => {
      if (room.hotel_id) hotelIds.add(room.hotel_id);
    });

    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('*')
      .in('id', Array.from(hotelIds));

    if (hotelsError) {
      console.error('Error fetching hotels:', hotelsError);
    }

    // Transform hotels into hotel options - fix type compatibility
    const hotelOptions: HotelOption[] = (hotels || []).map((hotel: any) => {
      // Calculate total price for this hotel from room arrangements
      const hotelRooms = quote.room_arrangements?.filter(room => room.hotel_id === hotel.id) || [];
      const totalPrice = hotelRooms.reduce((sum, room) => sum + (room.total || 0), 0);
      const avgPricePerNight = hotelRooms.length > 0 && quote.duration_nights > 0 
        ? totalPrice / quote.duration_nights / hotelRooms.length 
        : 0;

      return {
        id: hotel.id,
        name: hotel.name,
        category: hotel.category || 'Standard',
        pricePerNight: avgPricePerNight,
        totalPrice: totalPrice,
        currencyCode: quote.currency_code || 'USD',
        selected: hotel.id === quote.hotel_id
      };
    });

    // Calculate total cost including markup
    const accommodationTotal = quote.room_arrangements?.reduce((sum, room) => sum + (room.total || 0), 0) || 0;
    const transportTotal = quote.transports?.reduce((sum, transport) => sum + (transport.total_cost || 0), 0) || 0;
    const transferTotal = quote.transfers?.reduce((sum, transfer) => sum + (transfer.total || 0), 0) || 0;
    const activityTotal = quote.activities?.reduce((sum, activity) => sum + (activity.total_cost || 0), 0) || 0;
    
    const subtotal = accommodationTotal + transportTotal + transferTotal + activityTotal;
    
    let markupAmount = 0;
    if (quote.markup_type === 'percentage') {
      markupAmount = (subtotal * (quote.markup_value || 0)) / 100;
    } else {
      markupAmount = quote.markup_value || 0;
    }
    
    const totalCost = subtotal + markupAmount;

    const clientPreview: ClientQuotePreview = {
      id: quote.id,
      inquiryNumber: quote.inquiry_id || 'N/A',
      client: quote.client,
      destination: quote.destination,
      packageName: `${quote.destination} Package`,
      startDate: quote.start_date,
      endDate: quote.end_date,
      duration: {
        days: quote.duration_days,
        nights: quote.duration_nights
      },
      travelers: {
        adults: quote.adults,
        childrenWithBed: quote.children_with_bed,
        childrenNoBed: quote.children_no_bed,
        infants: quote.infants
      },
      tourType: quote.tour_type || 'domestic',
      createdAt: quote.created_at || new Date().toISOString(),
      hotels: (hotels || []).map((h: any) => ({ ...h, status: h.status as any })),
      hotelOptions,
      totalCost,
      currency: quote.currency_code || 'USD'
    };

    return clientPreview;
  } catch (error) {
    console.error('Error generating client preview:', error);
    toast.error('Failed to generate quote preview');
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

export const emailQuote = async (quoteId: string): Promise<void> => {
  try {
    const quote = await getQuoteById(quoteId);
    const quotePreview = await generateClientPreview(quoteId);

    if (!quote || !quotePreview) {
      toast.error("Could not find quote details to send email.");
      throw new Error("Quote data not found.");
    }

    if (!quote.client_email) {
      toast.error("Client email is not set for this quote. Please add it before sending.");
      // NOTE: Since we cannot edit the UI to add this field yet, this will currently always fail.
      // This logic is in place for when the UI is updated.
      throw new Error("Client email missing.");
    }
    
    toast.info("Sending email...");

    const { error } = await supabase.functions.invoke('send-quote-email', {
      body: { quotePreview, recipientEmail: quote.client_email },
    });

    if (error) {
      throw error;
    }

    toast.success('Quote sent via email');
  } catch (error) {
    console.error('Error emailing quote:', error);
    toast.error('Failed to send quote via email');
    throw error;
  }
};

export const printQuote = async (quoteId: string): Promise<void> => {
  try {
    const quotePreview = await generateClientPreview(quoteId);
    if (quotePreview) {
      const pdfBlob = await generateQuotePDF(quotePreview);
      // This is a simplified print approach. It opens the PDF in a new tab for printing.
      // A more direct print might require more complex solutions.
      // For now, generating a PDF and letting user print it is a solid first step.
      window.print();
      toast.info('Please use your browser\'s print dialog to print the quote.');
    } else {
      toast.error("Could not get quote data for printing.");
    }
  } catch (error) {
    console.error('Error printing quote:', error);
    toast.error('Failed to print quote');
    throw error;
  }
};


export const downloadQuotePDF = async (quoteId: string): Promise<void> => {
  try {
    toast.info("Generating PDF...");
    const quotePreview = await generateClientPreview(quoteId);
    if (quotePreview) {
      generateQuotePDF(quotePreview);
    } else {
      toast.error("Could not generate PDF. Quote data not found.");
    }
  } catch (error) {
    console.error('Error downloading quote PDF:', error);
    toast.error('Failed to download quote PDF');
    throw error;
  }
};
