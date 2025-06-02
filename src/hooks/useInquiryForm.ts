
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { createInquiry, InquiryValidationError } from "../services/inquiryService";
import { agentService } from "../services/agentService";
import { InquiryFormData, AvailableAgent, InquiryInsertData } from "../types/inquiry.types";

export const useInquiryForm = () => {
  const navigate = useNavigate();
  const { userProfile, loading } = useAuth();
  
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
    assigned_agent: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<AvailableAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const isAgent = userProfile?.role === 'agent';

  // Update tour consultant when userProfile changes
  useEffect(() => {
    if (userProfile?.full_name && !formData.tour_consultant) {
      setFormData(prev => ({
        ...prev,
        tour_consultant: userProfile.full_name || ''
      }));
    }
  }, [userProfile?.full_name, formData.tour_consultant]);

  // Load available agents for assignment
  useEffect(() => {
    const loadAgents = async () => {
      if (!userProfile?.org_id || isAgent || loading) {
        console.log('Skipping agent load - no org, user is agent, or still loading');
        return;
      }

      try {
        setLoadingAgents(true);
        console.log('Loading agents for org:', userProfile.org_id);
        const agents = await agentService.getAgents(userProfile.org_id);
        setAvailableAgents(agents.map(agent => ({
          id: agent.id,
          name: agent.name
        })));
        console.log('Loaded agents:', agents.length);
      } catch (error) {
        console.error('Error loading agents:', error);
        toast.error('Failed to load available agents');
      } finally {
        setLoadingAgents(false);
      }
    };

    // Only load agents if user profile is ready and user has an org
    if (userProfile?.id && userProfile?.org_id && !loading) {
      loadAgents();
    }
  }, [userProfile?.org_id, userProfile?.id, isAgent, loading]);

  const handleTabChange = (value: string) => {
    const tourType = value as 'domestic' | 'international';
    setActiveTab(tourType);
    setFormData(prev => ({
      ...prev,
      tour_type: tourType,
      destination: '',
      package_name: ''
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

    // Validation for organization membership
    if (!userProfile?.org_id && userProfile?.role !== 'system_admin') {
      errors.push("You must belong to an organization to create inquiries");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const prepareInquiryData = (status: 'Draft' | 'New'): InquiryInsertData => {
    const selectedAgent = availableAgents.find(a => a.id === formData.assigned_agent);
    
    // For agents, auto-assign to themselves
    const assignedTo = isAgent ? userProfile?.id : formData.assigned_agent || null;
    const assignedAgentName = isAgent ? userProfile?.full_name : selectedAgent?.name || null;
    
    const inquiryData: InquiryInsertData = {
      id: crypto.randomUUID(),
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
      created_by: userProfile?.id || null,
      status: status
    };

    console.log('Prepared inquiry data:', inquiryData);
    return inquiryData;
  };

  const saveDraft = async () => {
    if (isSubmitting) return;
    
    // Don't validate for drafts, just check basic requirements
    if (!userProfile?.id) {
      toast.error("Authentication required");
      return;
    }

    if (!formData.client_name?.trim()) {
      toast.error("Client name is required even for drafts");
      return;
    }

    // Check if user belongs to an organization (unless system admin)
    if (!userProfile.org_id && userProfile.role !== 'system_admin') {
      toast.error("You must belong to an organization to create inquiries");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const draftData = prepareInquiryData('Draft');
      
      console.log("Saving draft inquiry data:", draftData);
      await createInquiry(draftData);
      
      navigate("/inquiries");
    } catch (error) {
      console.error("Error saving draft:", error);
      
      if (error instanceof InquiryValidationError) {
        return;
      }
      
      // Error toast is handled by createInquiry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    if (!userProfile?.id) {
      toast.error("You must be logged in to create inquiries");
      return;
    }

    // Check if user belongs to an organization (unless system admin)
    if (!userProfile.org_id && userProfile.role !== 'system_admin') {
      toast.error("You must belong to an organization to create inquiries");
      return;
    }
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      const submittedFormData = prepareInquiryData('New');
      
      console.log("Submitting inquiry data:", submittedFormData);
      await createInquiry(submittedFormData);
      
      navigate("/inquiries");
      
    } catch (error) {
      console.error("Error creating inquiry:", error);
      
      if (error instanceof InquiryValidationError) {
        return;
      }
      
      // Error toast is handled by createInquiry
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab,
    formData,
    setFormData,
    validationErrors,
    availableAgents,
    isAgent,
    isSubmitting,
    loadingAgents,
    handleTabChange,
    saveDraft,
    handleSubmit,
    handleCancel
  };
};
