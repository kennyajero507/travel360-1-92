// Database types matching actual Supabase schema
// This file replaces the inconsistent types in index.ts

// Database types with proper JSON handling
export interface DatabaseInquiry {
  id: string;
  enquiry_number: string | null;
  client_name: string;
  client_email: string | null;
  client_mobile: string;
  destination: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  children_with_bed: number;
  children_no_bed: number;
  infants: number;
  num_rooms: number | null;
  tour_type: string;
  status: string;
  org_id: string;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  // Additional fields from schema
  days_count: number | null;
  nights_count: number | null;
  notes: string | null;
  priority: string | null;
  lead_source: string | null;
  tour_consultant: string | null;
  workflow_stage: string | null;
  visa_required: boolean | null;
  travel_insurance_required: boolean | null;
  passport_expiry_date: string | null;
  document_checklist: any; // JSON field - can be string, array, or object
  special_requirements: string | null;
}

export interface DatabaseQuote {
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
  org_id: string;
  sleeping_arrangements: any; // JSON fields
  transport_options: any;
  transfer_options: any;
  activities: any;
}

export interface DatabaseBooking {
  id: string;
  booking_reference: string;
  client: string;
  client_email: string | null;
  hotel_name: string;
  hotel_id: string | null;
  agent_id: string | null;
  travel_start: string;
  travel_end: string;
  room_arrangement: any | null;
  transport: any | null;
  activities: any | null;
  transfers: any | null;
  status: string;
  total_price: number;
  quote_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  org_id: string;
}

export interface DatabaseHotel {
  id: string;
  name: string;
  destination: string;
  category: string;
  location: string | null;
  address: string | null;
  description: string | null;
  contact_info: any | null;
  images: any | null;
  room_types: any | null;
  amenities: any | null;
  pricing: any | null;
  policies: any | null;
  additional_details: any | null;
  status: string;
  org_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // UI-only fields for display purposes
  rating?: number;
  room_count?: number;
}

export interface DatabaseProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  org_id: string | null;
  country: string | null;
  currency: string | null;
  email_notifications: boolean;
  sms_notifications: boolean;
  created_at: string;
  updated_at: string;
  trial_ends_at: string | null;
}

export interface DatabaseOrganization {
  id: string;
  name: string;
  owner_id: string | null;
  status: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  billing_cycle: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  tagline: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

// Helper types for forms and UI
export interface InquiryFormData {
  client_name: string;
  client_email?: string;
  client_mobile: string;
  destination: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  children_with_bed: number;
  children_no_bed: number;
  infants: number;
  num_rooms?: number;
  tour_type: string;
  notes?: string;
  priority?: string;
  lead_source?: string;
}

export interface BookingFormData {
  client: string;
  client_email?: string;
  hotel_name: string;
  travel_start: string;
  travel_end: string;
  total_price: number;
  notes?: string;
}

export interface HotelFormData {
  name: string;
  destination: string;
  category: string;
  location?: string;
  address?: string;
  description?: string;
  amenities?: string[];
  room_types?: any[];
  pricing?: any;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}