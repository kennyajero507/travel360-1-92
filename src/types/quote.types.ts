
export interface PersonTypeRates {
  adult: number;
  childWithBed: number;  // CWB
  childNoBed: number;    // CNB
  infant: number;
}

export interface RoomArrangement {
  id: string;
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
  markup: {
    type: "percentage" | "fixed" | "cost-plus";
    value: number;
  };
  notes: string;
  status: "draft" | "sent" | "approved" | "rejected";
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
