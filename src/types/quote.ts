export interface Quote {
  id: string;
  quote_number: string | null;
  inquiry_id: string | null;
  client: string;
  client_email: string | null;
  mobile: string;
  destination: string;
  start_date: string;
  end_date: string;
  duration_days: number | null;
  duration_nights: number | null;
  adults: number;
  children_with_bed: number | null;
  children_no_bed: number | null;
  infants: number | null;
  hotel_id: string | null;
  status: string;
  subtotal: number | null;
  markup_percentage: number | null;
  markup_amount: number | null;
  total_amount: number | null;
  currency_code: string | null;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  org_id: string | null;
  sleeping_arrangements: any[] | null;
  transport_options: any[] | null;
  transfer_options: any[] | null;
  activities: any[] | null;
}

export interface QuoteFormData {
  selected_hotel_id: string;
  markup_percentage: number;
  valid_until: string;
  notes: string;
  currency_code: string;
}

export interface SleepingArrangement {
  id: string;
  room_number: number;
  adults: number;
  children_with_bed: number;
  children_no_bed: number;
  room_type: string;
  cost_per_night: number;
}

export interface TransportOption {
  id: string;
  type: string;
  route: string;
  cost_per_person: number;
  total_passengers: number;
  total_cost: number;
}

export interface TransferOption {
  id: string;
  type: string;
  route: string;
  cost_per_person: number;
  total_passengers: number;
  total_cost: number;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  date: string;
  cost_per_person: number;
  num_people: number;
  total_cost: number;
  category: string;
  location: string;
  duration_hours: number;
}