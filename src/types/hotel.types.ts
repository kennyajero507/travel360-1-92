
export interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  bedOptions: string;
  ratePerNight: number;
  ratePerPersonPerNight?: number;
  amenities: string[];
  totalUnits: number;
}

export interface HotelAdditionalDetails {
  description?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  hasNegotiatedRate?: boolean;
  website?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  destination: string;
  category: string;
  contactDetails: Record<string, any>;
  roomTypes: RoomType[];
  additionalDetails?: HotelAdditionalDetails;
  status?: string; // Adding status field
}
