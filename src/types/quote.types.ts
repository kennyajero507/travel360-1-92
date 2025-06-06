
import { Hotel } from "./hotel.types";

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface RoomArrangement {
  id: string;
  roomType: string;
  adults: number;
  children: number;
  infants: number;
  numRooms: number;
  costPerAdult: number;
  costPerChild: number;
  costPerInfant: number;
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
  numPeople: number;
}

export interface QuoteTransfer {
  id: string;
  type: string;
  from: string;
  to: string;
  vehicleType?: string;
  cost: number;
  description?: string;
}

// Updated to match database structure - using snake_case for database fields
export interface QuoteData {
  id: string;
  inquiry_id?: string;
  client: string;
  mobile: string;
  destination: string;
  start_date: string; // Database uses snake_case
  end_date: string;   // Database uses snake_case
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
  
  // Legacy properties for backward compatibility
  startDate?: string;
  endDate?: string;
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
