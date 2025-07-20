// Core entity types for TravelFlow360

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  org_id?: string;
  created_at: string;
  trial_ends_at?: string;
  phone?: string;
  currency: string;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export type UserRole = 
  | 'system_admin' 
  | 'org_owner' 
  | 'tour_operator' 
  | 'agent' 
  | 'customer_service' 
  | 'accounts';

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  trial_ends_at?: string;
  subscription_tier: 'trial' | 'starter' | 'professional' | 'enterprise';
  logo_url?: string;
  tagline?: string;
  primary_color: string;
  secondary_color: string;
  currency: string;
  markup_default: number;
}

export interface Inquiry {
  id: string;
  inquiry_id: string; // ENQ-YYMM-XXX format
  client_name: string;
  client_email: string;
  client_phone?: string;
  destination: string;
  travel_type: 'domestic' | 'international';
  travel_start: string;
  travel_end: string;
  number_of_guests: number;
  guest_details?: GuestDetail[];
  special_requests?: string;
  status: 'new' | 'assigned' | 'quoted' | 'booked' | 'cancelled';
  assigned_agent_id?: string;
  created_by: string;
  created_at: string;
  org_id: string;
}

export interface GuestDetail {
  name: string;
  age?: number;
  passport_number?: string;
  nationality?: string;
}

export interface Quote {
  id: string;
  quote_id: string; // QUO-YYMM-XXX format
  inquiry_id: string;
  client_name: string;
  client_email: string;
  destination: string;
  travel_start: string;
  travel_end: string;
  number_of_guests: number;
  hotels: QuoteHotel[];
  transport: QuoteTransport[];
  room_arrangements: RoomArrangement[];
  subtotal: number;
  markup_percentage: number;
  markup_amount: number;
  total_price: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';
  valid_until: string;
  notes?: string;
  created_by: string;
  created_at: string;
  org_id: string;
}

export interface QuoteHotel {
  id: string;
  hotel_id: string;
  hotel_name: string;
  hotel_category: string;
  location: string;
  check_in: string;
  check_out: string;
  nights: number;
  room_type: string;
  meal_plan: string;
  cost_per_night: number;
  total_cost: number;
  is_primary: boolean; // For comparison quotes
}

export interface QuoteTransport {
  id: string;
  transport_type: 'flight' | 'bus' | 'train' | 'car' | 'transfer';
  vendor_name: string;
  route: string;
  departure_time?: string;
  arrival_time?: string;
  cost_per_person: number;
  total_cost: number;
}

export interface RoomArrangement {
  id: string;
  room_type: string;
  occupancy: number; // Number of people per room
  number_of_rooms: number;
  cost_per_room: number;
  total_cost: number;
}

export interface Booking {
  id: string;
  booking_id: string; // BOO-YYMM-XXX format
  quote_id: string;
  inquiry_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  destination: string;
  travel_start: string;
  travel_end: string;
  number_of_guests: number;
  guest_details: GuestDetail[];
  hotels: QuoteHotel[];
  transport: QuoteTransport[];
  total_price: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  payment_amount: number;
  voucher_generated: boolean;
  voucher_url?: string;
  agent_id: string;
  created_by: string;
  created_at: string;
  org_id: string;
}

export interface TravelVoucher {
  id: string;
  voucher_reference: string; // VOU-YYMM-XXX format
  booking_id: string;
  client_name: string;
  destination: string;
  travel_start: string;
  travel_end: string;
  guest_details: GuestDetail[];
  itinerary: VoucherItinerary[];
  emergency_contacts: EmergencyContact[];
  terms_conditions: string;
  issued_date: string;
  issued_by: string;
  org_id: string;
}

export interface VoucherItinerary {
  day: number;
  date: string;
  activities: string[];
  accommodation?: string;
  meals: string[];
  transport?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
}

export interface Hotel {
  id: string;
  name: string;
  category: '3-star' | '4-star' | '5-star' | 'boutique' | 'resort';
  location: string;
  destination_id: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  amenities: string[];
  room_types: HotelRoomType[];
  images: string[];
  description?: string;
  is_active: boolean;
  org_id: string;
}

export interface HotelRoomType {
  id: string;
  name: string;
  description?: string;
  max_occupancy: number;
  amenities: string[];
  cost_per_night: number;
  meal_plans: MealPlan[];
}

export interface MealPlan {
  type: 'room-only' | 'breakfast' | 'half-board' | 'full-board' | 'all-inclusive';
  additional_cost: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  type: 'domestic' | 'international';
  description?: string;
  popular_attractions: string[];
  best_time_to_visit?: string;
  is_active: boolean;
  org_id: string;
}

export interface TransportVendor {
  id: string;
  name: string;
  type: 'airline' | 'bus' | 'train' | 'car-rental' | 'transfer';
  contact_person?: string;
  phone?: string;
  email?: string;
  routes: TransportRoute[];
  is_active: boolean;
  org_id: string;
}

export interface TransportRoute {
  id: string;
  from_location: string;
  to_location: string;
  duration?: string;
  cost_per_person: number;
  vehicle_type?: string;
}

// Dashboard and Analytics Types
export interface DashboardStats {
  activeInquiries: number;
  pendingQuotes: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyGrowth: number;
  conversionRate: number;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalBookings: number;
  averageBookingValue: number;
  topDestinations: { name: string; bookings: number; revenue: number }[];
  topAgents: { name: string; bookings: number; revenue: number }[];
}

export interface MarkupReport {
  period: string;
  totalMarkup: number;
  averageMarkupPercentage: number;
  markupByDestination: { destination: string; markup: number }[];
  markupByAgent: { agent: string; markup: number }[];
}

// Form and UI Types
export interface InquiryFormData {
  client_name: string;
  client_email: string;
  client_phone?: string;
  destination: string;
  travel_type: 'domestic' | 'international';
  travel_start: string;
  travel_end: string;
  number_of_guests: number;
  special_requests?: string;
}

export interface QuoteFormData {
  inquiry_id: string;
  hotels: Partial<QuoteHotel>[];
  transport: Partial<QuoteTransport>[];
  room_arrangements: Partial<RoomArrangement>[];
  markup_percentage: number;
  valid_until: string;
  notes?: string;
}

// API Response Types
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

// Permission and Role Types
export interface Permission {
  action: string;
  resource: string;
}

export interface RolePermissions {
  [key: string]: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: 'inquiry' | 'quote' | 'booking' | 'payment' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

// Settings Types
export interface OrganizationSettings {
  markup_default: number;
  currency: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  auto_assign_agents: boolean;
  quote_validity_days: number;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  tagline?: string;
}