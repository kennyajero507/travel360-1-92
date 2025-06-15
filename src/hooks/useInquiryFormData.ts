
import { useState } from 'react';
import { InquiryFormData } from '../types/inquiry.types';

export const useInquiryFormData = () => {
  const [formData, setFormData] = useState<InquiryFormData>({
    tour_type: 'domestic',
    lead_source: '',
    tour_consultant: '',
    client_name: '',
    client_email: '',
    client_mobile: '',
    destination: '',
    package_name: '',
    custom_package: '',
    custom_destination: '',
    description: '',
    check_in_date: '',
    check_out_date: '',
    adults: 1,
    children: 0,
    infants: 0,
    num_rooms: 1,
    priority: '',
    assigned_agent: '',
    // International specific fields
    visa_required: false,
    passport_expiry_date: '',
    preferred_currency: '',
    flight_preference: '',
    travel_insurance_required: false,
    // Domestic specific fields
    regional_preference: '',
    transport_mode_preference: '',
    guide_language_preference: '',
    // Common enhanced fields
    estimated_budget_range: '',
    special_requirements: '',
    document_checklist: [],
    workflow_stage: 'initial',
  });

  return { formData, setFormData };
};
