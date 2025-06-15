
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface BookingTransport {
  mode: string;
  route: string;
  operator?: string;
  cost_per_person?: number;
  num_passengers?: number;
  total_cost?: number;
  description?: string;
  notes?: string;
}

export interface BookingActivity {
  name: string;
  description?: string;
  date?: string;
  cost_per_person?: number;
  num_people?: number;
  total_cost?: number;
}

export interface BookingTransfer {
  type: string;
  from: string;
  to: string;
  vehicle_type?: string;
  cost_per_vehicle?: number;
  num_vehicles?: number;
  total?: number;
  description?: string;
}

export interface RoomArrangement {
  room_type: string;
  adults: number;
  children_with_bed: number;
  children_no_bed: number;
  infants?: number;
  num_rooms?: number;
  rate_per_night?: number;
  total?: number;
}

export interface Booking {
  id: string;
  booking_reference: string;
  client: string;
  client_email?: string;
  hotel_name: string;
  hotel_id: string;
  agent_id?: string;
  travel_start: string;
  travel_end: string;
  room_arrangement: RoomArrangement[];
  transport: BookingTransport[];
  activities: BookingActivity[];
  transfers: BookingTransfer[];
  status: BookingStatus;
  total_price: number;
  quote_id: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Add the missing TravelVoucher interface
export interface TravelVoucher {
  id: string;
  booking_id: string;
  voucher_reference: string;
  issued_date: string;
  issued_by?: string;
  notes?: string;
  email_sent: boolean;
  voucher_pdf_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Add payment tracking interface
export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  payment_method?: string;
  payment_status: PaymentStatus;
  payment_date?: string;
  transaction_id?: string;
  currency_code: string;
  notes?: string;
  invoice_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Add notification interface
export interface BookingNotification {
  id: string;
  booking_id?: string;
  notification_type: string;
  recipient_email: string;
  subject: string;
  content: string;
  status?: string;
  sent_at?: string;
  created_at?: string;
}
