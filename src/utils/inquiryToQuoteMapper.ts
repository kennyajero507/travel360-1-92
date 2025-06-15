
import { InquiryData } from "../types/inquiry.types";
import { QuoteData } from "../types/quote.types";

export const mapInquiryToQuote = (inquiry: InquiryData): Partial<QuoteData> => {
  const startDate = new Date(inquiry.check_in_date);
  const endDate = new Date(inquiry.check_out_date);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    inquiry_id: inquiry.id,
    client: inquiry.client_name,
    mobile: inquiry.client_mobile,
    destination: inquiry.destination || inquiry.custom_destination || "",
    start_date: inquiry.check_in_date,
    end_date: inquiry.check_out_date,
    duration_days: daysDiff,
    duration_nights: Math.max(0, daysDiff - 1),
    adults: inquiry.adults,
    children_with_bed: inquiry.children, // Default assumption
    children_no_bed: 0, // Will need to be adjusted manually
    infants: inquiry.infants,
    tour_type: inquiry.tour_type,
    status: 'draft' as const,
    currency_code: 'USD',
    markup_type: 'percentage',
    markup_value: 15,
    notes: inquiry.description || "",
    room_arrangements: [],
    activities: [],
    transports: [],
    transfers: [],
    sectionMarkups: {}
  };
};
