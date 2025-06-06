
import { Hotel } from "./hotel.types";

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
  hotel_id?: string; // Match database field name
  room_type: string; // Match database field name
  num_rooms: number; // Match database field name
  adults: number;
  children_with_bed: number; // Match database field name
  children_no_bed: number; // Match database field name
  infants: number;
  rate_per_night: PersonTypeRates; // Match database structure
  nights: number;
  total: number;
}

export interface QuoteTransport {
  id: string;
  type: string;
  from: string;
  to: string;
  date: string;
  cost: number;
  description?: string;
}

export interface QuoteActivity {
  id: string;
  name: string;
  description?: string;
  date: string;
  cost: number;
  num_people: number;
}

export interface QuoteTransfer {
  id: string;
  type: string;
  from: string;
  to: string;
  vehicle_type?: string;
  cost: number;
  description?: string;
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
  currencyCode: string; // Added missing property
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
