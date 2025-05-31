
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
