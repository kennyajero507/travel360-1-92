
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { QuoteData } from "../types/quote.types";

// Mock service functions for quotes
export const getAllQuotes = async () => {
  // This will eventually connect to your quotes table
  // For now, return mock data
  console.log("Fetching quotes from service...");
  return [];
};

export const getQuoteById = async (id: string): Promise<QuoteData> => {
  console.log("Fetching quote by ID:", id);
  // Return complete mock quote data
  return {
    id,
    client: "John Doe",
    mobile: "+1234567890",
    destination: "Zanzibar",
    packageName: "Zanzibar Beach Package",
    startDate: "2024-08-20",
    endDate: "2024-08-27",
    duration: { days: 8, nights: 7 },
    travelers: { adults: 2, childrenWithBed: 1, childrenNoBed: 0, infants: 0 },
    status: "approved",
    tourType: "international",
    currencyCode: "USD",
    activities: [],
    transfers: [],
    transports: [],
    markup: {
      type: "percentage",
      value: 15
    },
    notes: "",
    createdBy: "agent-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hotelId: "hotel-1",
    approvedHotelId: "hotel-1",
    assignedAgent: "John Agent",
    inquiryId: "inquiry-1",
    inquiryNumber: "ENQ-2024-001",
    roomArrangements: [
      { 
        id: "room-1",
        hotelId: "hotel-1", 
        roomType: "Deluxe Ocean View", 
        nights: 7,
        numRooms: 1,
        adults: 2,
        childrenWithBed: 1,
        childrenNoBed: 0,
        infants: 0,
        ratePerNight: {
          adult: 150,
          childWithBed: 100,
          childNoBed: 50,
          infant: 0
        },
        total: 1400
      }
    ]
  };
};

export const saveQuote = async (quote: QuoteData): Promise<QuoteData> => {
  console.log("Saving quote:", quote);
  toast.success("Quote saved successfully");
  return { ...quote, id: quote.id || crypto.randomUUID() };
};

export const getAvailableInquiries = async () => {
  console.log("Fetching available inquiries for quotes...");
  // Return mock inquiries that can be converted to quotes
  return [
    {
      id: "inquiry-1",
      enquiry_number: "ENQ-2024-001",
      client_name: "John Doe",
      client_mobile: "+1234567890",
      destination: "Zanzibar",
      package_name: "Zanzibar Beach Package",
      check_in_date: "2024-08-20",
      check_out_date: "2024-08-27",
      adults: 2,
      children: 1,
      infants: 0,
      tour_type: "international",
      status: "Assigned",
      assigned_agent_name: "John Agent"
    }
  ];
};

export const generateClientPreview = async (quoteId: string) => {
  console.log("Generating client preview for quote:", quoteId);
  // Return mock client preview data
  return {
    id: quoteId,
    inquiryNumber: "ENQ-2024-001",
    client: "John Doe",
    destination: "Zanzibar",
    packageName: "Zanzibar Beach Package",
    startDate: "2024-08-20",
    endDate: "2024-08-27",
    duration: { days: 8, nights: 7 },
    travelers: { adults: 2, childrenWithBed: 1, childrenNoBed: 0, infants: 0 },
    tourType: "international",
    createdAt: new Date().toISOString(),
    hotels: [
      {
        id: "hotel-1",
        name: "Zanzibar Beach Resort",
        category: "5 Star",
        location: "Stone Town, Zanzibar",
        roomArrangements: [
          {
            roomType: "Deluxe Ocean View",
            numRooms: 1,
            guests: 3,
            nights: 7,
            total: 1400
          }
        ],
        totalCost: 1400
      }
    ],
    hotelOptions: [
      {
        id: "hotel-1",
        name: "Zanzibar Beach Resort",
        category: "5 Star",
        location: "Stone Town, Zanzibar",
        roomArrangements: [
          {
            roomType: "Deluxe Ocean View",
            numRooms: 1,
            guests: 3,
            nights: 7,
            total: 1400
          }
        ],
        totalCost: 1400,
        totalPrice: 1610,
        currencyCode: "USD"
      }
    ],
    totalCost: 1400,
    currency: "USD"
  };
};

export const updateQuoteStatus = async (id: string, status: string, hotelId?: string) => {
  console.log("Updating quote status:", id, status, hotelId);
  toast.success(`Quote ${id} status updated to ${status}`);
  return true;
};

export const deleteQuote = async (id: string) => {
  console.log("Deleting quote:", id);
  toast.success(`Quote ${id} deleted successfully`);
  return true;
};

export const emailQuote = async (id: string) => {
  console.log("Emailing quote:", id);
  toast.success(`Quote ${id} sent to client via email`);
  return true;
};

export const printQuote = async (id: string) => {
  console.log("Printing quote:", id);
  window.print();
  return true;
};

export const downloadQuotePDF = async (id: string) => {
  console.log("Downloading quote PDF:", id);
  toast.success(`Quote ${id} downloaded as PDF`);
  return true;
};
