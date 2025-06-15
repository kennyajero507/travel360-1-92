export interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  bedOptions: string;
  ratePerNight: number;
  ratePerPersonPerNight?: number;
  amenities: string[];
  totalUnits: number;
  isOutOfOrder?: boolean; // <--- Added for maintenance/out of order state
}

export interface HotelAdditionalDetails {
  description?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  hasNegotiatedRate?: boolean;
  website?: string;
}

// Updated to match database structure
export interface Hotel {
  id: string;
  name: string;
  destination: string;
  category: string;
  status: 'Active' | 'Inactive';
  location?: string;
  address?: string;
  description?: string;
  amenities?: string[];
  room_types?: RoomType[];
  images?: string[];
  contact_info?: any;
  pricing?: any;
  policies?: any;
  additional_details?: HotelAdditionalDetails;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  org_id?: string;
  
  // Legacy properties for backward compatibility
  contactDetails?: any;
  roomTypes?: RoomType[];
}
