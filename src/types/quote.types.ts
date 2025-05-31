
export interface PersonTypeRates {
  adult: number;
  childWithBed: number;  // CWB
  childNoBed: number;    // CNB
  infant: number;
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
  ratePerNight: PersonTypeRates;
  nights: number;
  total: number;
}

export interface QuoteActivity {
  id: string;
  name: string;
  description: string;
  costPerPerson: {
    adult: number;
    child: number;
    infant: number;
  };
  included: {
    adults: number;
    children: number;
    infants: number;
  };
  total: number;
}

export interface QuoteTransport {
  id: string;
  type: string;
  description: string;
  costPerPerson: {
    adult: number;
    child: number;
    infant: number;
  };
  included: {
    adults: number;
    children: number;
    infants: number;
  };
  total: number;
}

export interface QuoteTransfer {
  id: string;
  transferType: "Airport to Hotel" | "Hotel to Hotel" | "Custom";
  fromLocation: string;
  toLocation: string;
  vehicleType: string;
  numberOfVehicles: number;
  costPerVehicle: number;
  total: number;
}

export interface Hotel {
  id: string;
  name: string;
  category?: string;
  destination?: string;
}

export interface QuoteData {
  id?: string;
  inquiryId?: string;
  inquiryNumber?: string; // New field for inquiry number display
  client: string;
  mobile: string;
  destination: string;
  packageName?: string; // New field for package name
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
  tourType: 'domestic' | 'international'; // New field
  currencyCode: string; // New field
  roomArrangements: RoomArrangement[];
  activities: QuoteActivity[];
  transports: QuoteTransport[];
  transfers: QuoteTransfer[];
  markup: {
    type: "percentage" | "fixed";
    value: number;
  };
  notes: string;
  status?: "draft" | "sent" | "approved" | "rejected";
  createdBy?: string;
  assignedAgent?: string; // New field
  createdAt?: string;
  updatedAt?: string;
  hotelId?: string;
  approvedHotelId?: string;
}

// New types for client preview
export interface HotelOption {
  id: string;
  name: string;
  totalPrice: number;
  currencyCode: string;
}

export interface ClientQuotePreview {
  inquiryNumber: string;
  client: string;
  destination: string;
  packageName?: string;
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
  tourType: 'domestic' | 'international';
  hotelOptions: HotelOption[];
  createdAt: string;
}

export interface HotelSummary {
  hotel: Hotel;
  roomArrangements: RoomArrangement[];
  totalCost: number;
}

export interface QuoteSummary {
  hotelSummaries: HotelSummary[];
  transportTotal: number;
  transferTotal: number;
  activityTotal: number;
  subtotal: number;
  markup: number;
  total: number;
}
