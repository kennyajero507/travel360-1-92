import { Hotel } from "./hotel.types";
import { QuoteSummaryData } from "./quoteSummary.types";

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

// Person type rates interface for room pricing
export interface PersonTypeRates {
  adult: number;
  childWithBed: number;
  childNoBed: number;
  infant: number;
}

// Updated RoomArrangement interface to match database schema
export interface RoomArrangement {
  id: string;
  hotel_id?: string;
  room_type: string;
  num_rooms: number;
  adults: number;
  children_with_bed: number;
  children_no_bed: number;
  infants: number;
  rate_per_night: PersonTypeRates;
  nights: number;
  total: number;
}

// Enhanced transport interface
export interface QuoteTransport {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'private_car' | 'taxi';
  from: string;
  to: string;
  date: string;
  time?: string;
  provider?: string;
  booking_reference?: string;
  cost_per_person: number;
  num_passengers: number;
  total_cost: number;
  description?: string;
  notes?: string;
}

// Enhanced activity interface with hotel_id
export interface QuoteActivity {
  id: string;
  name: string;
  category?: string;
  description?: string;
  date: string;
  time?: string;
  duration_hours?: number;
  location?: string;
  cost_per_person: number;
  num_people: number;
  total_cost: number;
  group_discount?: number;
  notes?: string;
  hotel_id?: string; // Added hotel_id for multi-hotel comparison
}

// Enhanced transfer interface with hotel_id
export interface QuoteTransfer {
  id: string;
  type: 'airport_pickup' | 'airport_drop' | 'hotel_transfer' | 'sightseeing' | 'intercity';
  from: string;
  to: string;
  date: string;
  time?: string;
  vehicle_type: string;
  vehicle_capacity?: number;
  distance_km?: number;
  duration_minutes?: number;
  cost_per_vehicle: number;
  num_vehicles: number;
  total: number;
  description?: string;
  notes?: string;
  hotel_id?: string; // Added hotel_id for multi-hotel comparison
}

// Section markup interface
export interface SectionMarkup {
  type: 'percentage' | 'fixed';
  value: number;
  applied_to: 'accommodation' | 'transport' | 'transfer' | 'activity' | 'all';
}

// Main QuoteData interface matching database structure
export interface QuoteData {
  id: string;
  inquiry_id?: string;
  client: string;
  mobile: string;
  destination: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  duration_nights: number;
  adults: number;
  children_with_bed: number;
  children_no_bed: number;
  infants: number;
  tour_type: string;
  status: QuoteStatus;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_hotel_id?: string;
  hotel_id?: string;
  currency_code: string;
  markup_type: string;
  markup_value: number;
  room_arrangements: RoomArrangement[];
  activities: QuoteActivity[];
  transports: QuoteTransport[];
  transfers: QuoteTransfer[];
  sectionMarkups?: Record<string, SectionMarkup>;
  summary_data?: QuoteSummaryData; // Added summary_data field
}

// Enhanced quote calculations interface
export interface QuoteCalculations {
  accommodation_subtotal: number;
  transport_subtotal: number;
  transfer_subtotal: number;
  excursion_subtotal: number; // Keep this for backwards compatibility in calculations
  subtotal: number;
  markup_amount: number;
  total_amount: number;
  per_person_cost: number;
  section_markups: Record<string, number>;
}

// Quote validation interface
export interface QuoteValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completionPercentage: number;
}

export interface QuoteFormData {
  client: string;
  mobile: string;
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  childrenWithBed: number;
  childrenNoBed: number;
  infants: number;
  tourType: string;
  notes?: string;
}

export interface QuotePreview {
  id: string;
  inquiryNumber: string;
  client: string;
  destination: string;
  packageName: string;
  startDate: string;
  endDate: string;
  duration: {
    days: number;
    nights: number;
  };
  travelers: {
    adults: number;
    childrenWithBed: number;
    childrenNoBed: number;
    infants: number;
  };
  tourType: string;
  createdAt: string;
  hotels: Hotel[];
  hotelOptions: Hotel[];
  totalCost: number;
  currency: string;
}

export interface HotelOption {
  id: string;
  name: string;
  category: string;
  pricePerNight: number;
  totalPrice: number;
  currencyCode: string;
  selected?: boolean;
}

export interface ClientQuotePreview {
  id: string;
  inquiryNumber: string;
  client: string;
  destination: string;
  packageName: string;
  startDate: string;
  endDate: string;
  duration: {
    days: number;
    nights: number;
  };
  travelers: {
    adults: number;
    childrenWithBed: number;
    childrenNoBed: number;
    infants: number;
  };
  tourType: string;
  createdAt: string;
  hotels: Hotel[];
  hotelOptions: HotelOption[];
  totalCost: number;
  currency: string;
}
