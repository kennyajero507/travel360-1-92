
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
    client_email: inquiry.client_email || undefined,
    destination: inquiry.destination || inquiry.custom_destination || "",
    start_date: inquiry.check_in_date,
    end_date: inquiry.check_out_date,
    duration_days: daysDiff,
    duration_nights: Math.max(0, daysDiff - 1),
    adults: inquiry.adults,
    children_with_bed: inquiry.children,
    children_no_bed: 0,
    infants: inquiry.infants,
    tour_type: inquiry.tour_type as 'domestic' | 'international',
    status: 'draft' as const,
    currency_code: inquiry.preferred_currency || 'USD',
    markup_type: 'percentage',
    markup_value: 15,
    notes: inquiry.description || "",
    room_arrangements: [],
    activities: [],
    transports: [],
    transfers: [],
    sectionMarkups: {},
    
    // Enhanced international fields
    visa_required: inquiry.visa_required || false,
    passport_expiry_date: inquiry.passport_expiry_date || undefined,
    preferred_currency: inquiry.preferred_currency || undefined,
    flight_preference: inquiry.flight_preference || undefined,
    travel_insurance_required: inquiry.travel_insurance_required || false,
    visa_documentation: [],
    
    // Enhanced domestic fields
    regional_preference: inquiry.regional_preference || undefined,
    transport_mode_preference: inquiry.transport_mode_preference || undefined,
    guide_language_preference: inquiry.guide_language_preference || undefined,
    
    // Enhanced common fields
    estimated_budget_range: inquiry.estimated_budget_range || undefined,
    special_requirements: inquiry.special_requirements || undefined,
    document_checklist: inquiry.document_checklist || [],
    workflow_stage: inquiry.workflow_stage || 'initial',
    
    // Initialize empty itinerary
    itinerary: []
  };
};
