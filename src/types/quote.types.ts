
export interface PersonTypeRates {
  adult: number;
  childWithBed: number;  // CWB
  childNoBed: number;    // CNB
  infant: number;
}

export interface RoomArrangement {
  id: string;
  hotelId?: string;      // Added hotelId to link a room arrangement to a specific hotel
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
  roomArrangements: RoomArrangement[];
  activities: QuoteActivity[];
  transports: QuoteTransport[];
  transfers: QuoteTransfer[]; // New field for transfers
  markup: {
    type: "percentage" | "fixed";
    value: number;
  };
  notes: string;
  status: "draft" | "sent" | "approved" | "rejected";
  hotelId?: string; // We'll keep this for backward compatibility
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
