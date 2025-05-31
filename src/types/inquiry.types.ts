
export interface InquiryFormData {
  tour_type: 'domestic' | 'international';
  lead_source: string;
  tour_consultant: string;
  client_name: string;
  client_email: string;
  client_mobile: string;
  destination: string;
  package_name: string;
  custom_package: string;
  custom_destination: string;
  description: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  infants: number;
  num_rooms: number;
  priority: string;
  assigned_agent: string;
}

// Database insert type - matches exactly what we send to Supabase
export interface InquiryInsertData {
  tour_type: string;
  lead_source?: string | null;
  tour_consultant?: string | null;
  client_name: string;
  client_email?: string | null;
  client_mobile: string;
  destination: string;
  package_name?: string | null;
  custom_package?: string | null;
  custom_destination?: string | null;
  description?: string | null;
  check_in_date: string;
  check_out_date: string;
  days_count?: number | null;
  nights_count?: number | null;
  adults: number;
  children: number;
  infants: number;
  num_rooms?: number | null;
  priority?: string | null;
  assigned_to?: string | null;
  assigned_agent_name?: string | null;
  created_by?: string | null;
  status: string;
}

// Full inquiry data type - includes all database fields
export interface InquiryData {
  id?: string;
  enquiry_number?: string;
  tour_type: string;
  lead_source?: string | null;
  tour_consultant?: string | null;
  client_name: string;
  client_email?: string | null;
  client_mobile: string;
  destination: string;
  package_name?: string | null;
  custom_package?: string | null;
  custom_destination?: string | null;
  description?: string | null;
  check_in_date: string;
  check_out_date: string;
  days_count?: number | null;
  nights_count?: number | null;
  adults: number;
  children: number;
  infants: number;
  num_rooms?: number | null;
  priority?: string;
  assigned_to?: string | null;
  assigned_agent_name?: string | null;
  created_by?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface InquiryFormProps {
  formData: InquiryFormData;
  setFormData: (data: InquiryFormData) => void;
  validationErrors: string[];
  activeTab: 'domestic' | 'international';
}

export interface AvailableAgent {
  id: string;
  name: string;
}
