
import { supabase } from "../../integrations/supabase/client";
import { ClientQuotePreview, HotelOption } from "../../types/quote.types";
import { toast } from "sonner";
import { generateQuotePDF } from "../pdfQuoteGenerator";
import { getQuoteById } from "./core";

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
