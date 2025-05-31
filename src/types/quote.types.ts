
export interface QuoteData {
  id?: string;
  inquiryId?: string;
  client: string;
  mobile: string;
  destination: string;
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
  status: string;
  tourType: string;
  currencyCode: string;
  activities: any[];
  transfers: any[];
  transports: any[];
  roomArrangements: RoomArrangement[];
  markupType: string;
  markupValue: number;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  hotelId?: string;
  approvedHotelId?: string;
}

export interface RoomArrangement {
  id: string;
  hotelId?: string;
  roomType: string;
  numRooms: number;
  adults: number;
  childrenWithBed: number;
  childrenNoBed: number;
  infants: number;
  ratePerNight: {
    adult: number;
    childWithBed: number;
    childNoBed: number;
    infant: number;
  };
  nights: number;
  total: number;
}

export interface ClientQuotePreview {
  id: string;
  client: string;
  destination: string;
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
  hotels: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    roomArrangements: Array<{
      roomType: string;
      numRooms: number;
      guests: number;
      nights: number;
      total: number;
    }>;
    totalCost: number;
  }>;
  totalCost: number;
  currency: string;
}
