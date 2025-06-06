
import { QuoteActivity, QuoteTransport, QuoteTransfer, RoomArrangement } from "./quote.types";

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'paid' | 'partially_paid' | 'pending';

// Updated to match database structure with proper JSON field handling
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
  room_arrangement: RoomArrangement[]; // This will be JSON in DB
  transport: QuoteTransport[];         // This will be JSON in DB
  activities: QuoteActivity[];         // This will be JSON in DB
  transfers: QuoteTransfer[];          // This will be JSON in DB
  status: BookingStatus;
  payment_status?: PaymentStatus;
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

export interface BookingFormData {
  hotel_id: string;
  payment_status: PaymentStatus;
  notes?: string;
}
