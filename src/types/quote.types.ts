
export interface QuoteData {
  id?: string;
  inquiryId?: string;
  inquiryNumber?: string;
  client: string;
  mobile: string;
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
  status: string;
  tourType: string;
  currencyCode: string;
  activities: QuoteActivity[];
  transfers: QuoteTransfer[];
  transports: QuoteTransport[];
  roomArrangements: RoomArrangement[];
  markup: {
    type: string;
    value: number;
  };
  markupType?: string;
  markupValue?: number;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  hotelId?: string;
  approvedHotelId?: string;
  assignedAgent?: string;
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

export interface PersonTypeRates {
  adult: number;
  childWithBed: number;
  childNoBed: number;
  infant: number;
}

export interface QuoteActivity {
  id: string;
  title: string;
  description?: string;
  numPeople: number;
  costPerPerson: number;
  total: number;
}

export interface QuoteTransport {
  id: string;
  type: string;
  from: string;
  to: string;
  vehicleType?: string;
  numVehicles: number;
  costPerVehicle: number;
  total: number;
}

export interface QuoteTransfer {
  id: string;
  transferType: string;
  fromLocation?: string;
  toLocation?: string;
  vehicleType?: string;
  numVehicles: number;
  costPerVehicle: number;
  total: number;
  details?: string;
}

export interface Hotel {
  id: string;
  name: string;
  category?: string;
  location?: string;
  destination?: string;
  roomTypes?: HotelRoomType[];
}

export interface HotelOption {
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
  totalPrice: number;
  currencyCode: string;
}

export interface HotelRoomType {
  id: string;
  name: string;
  rate?: number;
  childRate?: number;
  childNoBedrRate?: number;
}

export interface ClientQuotePreview {
  id: string;
  inquiryNumber?: string;
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
  tourType?: string;
  createdAt?: string;
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
  hotelOptions?: HotelOption[];
  totalCost: number;
  currency: string;
}
