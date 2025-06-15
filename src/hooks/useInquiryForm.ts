
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { agentService } from "../services/agentService";
import { InquiryFormData, AvailableAgent, InquiryInsertData } from "../types/inquiry.types";
import { useCreateInquiry } from "./useInquiryData";

export const useInquiryForm = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const createInquiryMutation = useCreateInquiry();
  
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>('domestic');
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
    adults: 2,
    children: 0,
    infants: 0,
    num_rooms: 1,
    priority: 'Normal',
    assigned_agent: '',
    // International specific fields
    visa_required: false,
    passport_expiry_date: '',
    preferred_currency: 'USD',
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
    workflow_stage: 'initial'
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<AvailableAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const isAgent = profile?.role === 'agent';

  // Update tour consultant when userProfile changes
  useEffect(() => {
    if (profile?.full_name && !formData.tour_consultant) {
      setFormData(prev => ({
        ...prev,
        tour_consultant: profile.full_name || ''
      }));
    }
  }, [profile?.full_name, formData.tour_consultant]);

  // Load available agents for assignment
  useEffect(() => {
    const loadAgents = async () => {
      if (!profile?.org_id || isAgent || authLoading) {
        return;
      }

      try {
        setLoadingAgents(true);
        const agents = await agentService.getAgents(profile.org_id);
        setAvailableAgents(agents.map(agent => ({
          id: agent.id,
          name: agent.name
        })));
      } catch (error) {
        console.error('Error loading agents:', error);
        toast.error('Failed to load available agents');
      } finally {
        setLoadingAgents(false);
      }
    };

    if (profile?.id && profile?.org_id && !authLoading) {
      loadAgents();
    }
  }, [profile?.org_id, profile?.id, isAgent, authLoading]);

  const handleTabChange = (value: string) => {
    const tourType = value as 'domestic' | 'international';
    setActiveTab(tourType);
    setFormData(prev => ({
      ...prev,
      tour_type: tourType,
      destination: '',
      package_name: '',
      // Reset type-specific fields when switching
      visa_required: tourType === 'international' ? false : prev.visa_required,
      passport_expiry_date: tourType === 'international' ? '' : prev.passport_expiry_date,
      preferred_currency: tourType === 'international' ? 'USD' : prev.preferred_currency,
      flight_preference: tourType === 'international' ? '' : prev.flight_preference,
      travel_insurance_required: tourType === 'international' ? false : prev.travel_insurance_required,
      regional_preference: tourType === 'domestic' ? '' : prev.regional_preference,
      transport_mode_preference: tourType === 'domestic' ? '' : prev.transport_mode_preference,
      guide_language_preference: tourType === 'domestic' ? '' : prev.guide_language_preference
    }));
  };

  const handleCancel = () => {
    navigate("/inquiries");
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.client_name?.trim()) {
      errors.push("Client Name is required");
    }
    
    if (!formData.client_mobile?.trim()) {
      errors.push("Mobile Number is required");
    }
    
    if (!formData.check_in_date) {
      errors.push("Check-in Date is required");
    }
    
    if (!formData.check_out_date) {
      errors.push("Check-out Date is required");
    }
    
    if (formData.check_in_date && formData.check_out_date) {
      const checkInDate = new Date(formData.check_in_date);
      const checkOutDate = new Date(formData.check_out_date);
      
      if (checkOutDate <= checkInDate) {
        errors.push("Check-out date must be after check-in date");
      }
    }

    if (!formData.destination && !formData.custom_destination?.trim()) {
      errors.push("Please select a destination or enter a custom destination");
    }

    if (formData.adults < 1) {
      errors.push("At least 1 adult is required");
    }

    if (formData.num_rooms < 1) {
      errors.push("At least 1 room is required");
    }

    // International tour specific validations
    if (formData.tour_type === 'international') {
      if (formData.passport_expiry_date) {
        const passportExpiry = new Date(formData.passport_expiry_date);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        
        if (passportExpiry <= sixMonthsFromNow) {
          errors.push("Passport should be valid for at least 6 months from travel date");
        }
      }
    }

    // Validation for organization membership
    if (!profile?.org_id && profile?.role !== 'system_admin') {
      errors.push("You must belong to an organization to create inquiries");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const prepareInquiryData = (status: 'Draft' | 'New'): InquiryInsertData => {
    const selectedAgent = availableAgents.find(a => a.id === formData.assigned_agent);
    
    // For agents, auto-assign to themselves
    const assignedTo = isAgent ? profile?.id : formData.assigned_agent || null;
    const assignedAgentName = isAgent ? profile?.full_name : selectedAgent?.name || null;
    
    const inquiryData: InquiryInsertData = {
      id: crypto.randomUUID(),
      org_id: profile?.org_id || null,
      tour_type: formData.tour_type,
      lead_source: formData.lead_source || null,
      tour_consultant: formData.tour_consultant || null,
      client_name: formData.client_name.trim(),
      client_email: formData.client_email?.trim() || null,
      client_mobile: formData.client_mobile.trim(),
      destination: formData.destination || formData.custom_destination || '',
      package_name: formData.package_name || formData.custom_package || null,
      custom_package: formData.custom_package || null,
      custom_destination: formData.custom_destination || null,
      description: formData.description || null,
      check_in_date: formData.check_in_date,
      check_out_date: formData.check_out_date,
      adults: formData.adults,
      children: formData.children,
      infants: formData.infants,
      num_rooms: formData.num_rooms,
      priority: formData.priority,
      assigned_to: assignedTo,
      assigned_agent_name: assignedAgentName,
      created_by: profile?.id || null,
      status: status,
      // New enhanced fields
      visa_required: formData.tour_type === 'international' ? formData.visa_required : null,
      passport_expiry_date: formData.tour_type === 'international' && formData.passport_expiry_date ? formData.passport_expiry_date : null,
      preferred_currency: formData.tour_type === 'international' ? formData.preferred_currency : null,
      flight_preference: formData.tour_type === 'international' ? formData.flight_preference || null : null,
      travel_insurance_required: formData.tour_type === 'international' ? formData.travel_insurance_required : null,
      regional_preference: formData.tour_type === 'domestic' ? formData.regional_preference || null : null,
      transport_mode_preference: formData.tour_type === 'domestic' ? formData.transport_mode_preference || null : null,
      guide_language_preference: formData.tour_type === 'domestic' ? formData.guide_language_preference || null : null,
      estimated_budget_range: formData.estimated_budget_range || null,
      special_requirements: formData.special_requirements || null,
      document_checklist: formData.document_checklist.length > 0 ? formData.document_checklist : null,
      workflow_stage: formData.workflow_stage || 'initial'
    };

    console.log('Prepared inquiry data:', inquiryData);
    return inquiryData;
  };

  const saveDraft = () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }
    const inquiryData = prepareInquiryData('Draft');
    createInquiryMutation.mutate(inquiryData, {
      onSuccess: () => {
        toast.success("Draft saved successfully!");
        navigate("/inquiries");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting.");
      return;
    }
    const inquiryData = prepareInquiryData('New');
    createInquiryMutation.mutate(inquiryData, {
      onSuccess: () => {
        toast.success("Inquiry submitted successfully!");
        navigate("/inquiries");
      }
    });
  };

  return {
    activeTab,
    formData,
    setFormData,
    validationErrors,
    availableAgents,
    isAgent,
    isSubmitting: createInquiryMutation.isPending,
    loadingAgents,
    handleTabChange,
    saveDraft,
    handleSubmit,
    handleCancel
  };
};
