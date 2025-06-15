
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
  // International specific fields
  visa_required: boolean;
  passport_expiry_date: string;
  preferred_currency: string;
  flight_preference: string;
  travel_insurance_required: boolean;
  // Domestic specific fields
  regional_preference: string;
  transport_mode_preference: string;
  guide_language_preference: string;
  // Common enhanced fields
  estimated_budget_range: string;
  special_requirements: string;
  document_checklist: string[];
  workflow_stage: string;
}

// Database insert type - for creating new inquiries
export interface InquiryInsertData {
  id: string;
  org_id: string | null;
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
  adults: number;
  children: number;
  infants: number;
  num_rooms?: number | null;
  priority?: string | null;
  assigned_to?: string | null;
  assigned_agent_name?: string | null;
  created_by?: string | null;
  status: string;
  // New fields
  visa_required?: boolean | null;
  passport_expiry_date?: string | null;
  preferred_currency?: string | null;
  flight_preference?: string | null;
  travel_insurance_required?: boolean | null;
  regional_preference?: string | null;
  transport_mode_preference?: string | null;
  guide_language_preference?: string | null;
  estimated_budget_range?: string | null;
  special_requirements?: string | null;
  document_checklist?: any | null;
  workflow_stage?: string | null;
}

// Full inquiry data type - includes all database fields
export interface InquiryData {
  id: string;
  org_id: string | null;
  enquiry_number: string;
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
  created_at?: string;
  updated_at?: string;
  // New fields
  visa_required?: boolean | null;
  passport_expiry_date?: string | null;
  preferred_currency?: string | null;
  flight_preference?: string | null;
  travel_insurance_required?: boolean | null;
  regional_preference?: string | null;
  transport_mode_preference?: string | null;
  guide_language_preference?: string | null;
  estimated_budget_range?: string | null;
  special_requirements?: string | null;
  document_checklist?: any | null;
  workflow_stage?: string | null;
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
