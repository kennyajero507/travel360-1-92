
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

// Mock service functions for quotes
export const getAllQuotes = async () => {
  // This will eventually connect to your quotes table
  // For now, return mock data
  console.log("Fetching quotes from service...");
  return [];
};

export const getQuoteById = async (id: string) => {
  console.log("Fetching quote by ID:", id);
  // Return mock quote data for now
  return {
    id,
    client: "John Doe",
    destination: "Zanzibar",
    startDate: "2024-08-20",
    endDate: "2024-08-27",
    duration: { days: 8, nights: 7 },
    travelers: { adults: 2, childrenWithBed: 1, childrenNoBed: 0, infants: 0 },
    status: "approved",
    roomArrangements: [
      { hotelId: "hotel-1", roomType: "Deluxe Ocean View", nights: 7 }
    ]
  };
};

export const updateQuoteStatus = async (id: string, status: string) => {
  console.log("Updating quote status:", id, status);
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
