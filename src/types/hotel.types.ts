
export interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  bedOptions: string;
  ratePerNight: number;
  amenities: string[];
  totalUnits: number;
  ratePerPersonPerNight?: number; // For per-person pricing in quotes
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  destination: string;
  category: string;
  contactDetails: any;
  roomTypes?: RoomType[];
  description?: string;
  additionalDetails?: {
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    hasNegotiatedRate?: boolean;
    website?: string;
  };
}

// Types for accommodation in quotes
export interface AccommodationQuote {
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomTypeName: string;
  paxPerRoom: number;
  roomsNeeded: number;
  costPerPersonPerNight: number;
  nights: number;
  totalCost: number;
}
