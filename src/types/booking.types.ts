
import { QuoteActivity, QuoteTransport, QuoteTransfer, RoomArrangement } from "./quote.types";

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  booking_reference: string;
  quote_id: string;
  client: string;
  agent_id?: string;
  hotel_id: string;
  hotel_name: string;
  travel_start: string;
  travel_end: string;
  room_arrangement: RoomArrangement[];
  transport: QuoteTransport[];
  activities: QuoteActivity[];
  transfers: QuoteTransfer[];
  status: BookingStatus;
  total_price: number;
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

export interface TravelVoucher {
  id: string;
  booking_id: string;
  voucher_reference: string;
  voucher_pdf_url?: string;
  issued_date: string;
  issued_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  email_sent: boolean;
}
