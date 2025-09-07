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
  // Enhanced fields
  quote_type?: string;
  client_portal_token?: string;
  client_viewed_at?: string | null;
  client_response_deadline?: string | null;
  terms_conditions?: string | null;
  inclusions?: any[];
  exclusions?: any[];
  payment_terms?: string | null;
  cancellation_policy?: string | null;
  requires_approval?: boolean;
  approval_status?: string;
  sent_to_client_at?: string | null;
  follow_up_count?: number;
  last_follow_up_at?: string | null;
}

export interface QuoteFormData {
  selected_hotel_id: string;
  markup_percentage: number;
  valid_until: string;
  notes: string;
  currency_code: string;
  terms_conditions?: string;
  inclusions?: string[];
  exclusions?: string[];
  payment_terms?: string;
  cancellation_policy?: string;
  client_response_deadline?: string;
}

export interface QuoteOption {
  id?: string;
  quote_id?: string;
  option_name: string;
  option_description?: string;
  base_price: number;
  total_price: number;
  currency_code: string;
  inclusions: string[];
  exclusions: string[];
  hotel_details: any;
  transport_details: any;
  activity_details: any;
  is_recommended: boolean;
  is_selected: boolean;
  sort_order: number;
}

export interface QuoteTemplate {
  id?: string;
  org_id?: string;
  template_name: string;
  template_description?: string;
  destination: string;
  duration_days: number;
  duration_nights: number;
  base_inclusions: string[];
  base_exclusions: string[];
  default_hotels: any[];
  default_activities: any[];
  default_transport: any;
  pricing_structure: any;
  terms_conditions?: string;
  is_active: boolean;
  created_by?: string;
}

export interface QuoteInteraction {
  id?: string;
  quote_id: string;
  interaction_type: 'viewed' | 'downloaded' | 'accepted' | 'rejected' | 'feedback';
  client_email?: string;
  client_ip_address?: string;
  interaction_data?: any;
  user_agent?: string;
  created_at?: string;
}

export interface QuoteApproval {
  id?: string;
  quote_id: string;
  approver_id: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_notes?: string;
  approval_level: number;
  approved_at?: string;
  created_at?: string;
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