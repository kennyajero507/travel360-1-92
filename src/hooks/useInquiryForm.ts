
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { createInquiry, InquiryValidationError } from "../services/inquiryService";
import { agentService } from "../services/agentService";
import { InquiryFormData, AvailableAgent, InquiryInsertData } from "../types/inquiry.types";

export const useInquiryForm = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>('domestic');
  const [formData, setFormData] = useState<InquiryFormData>({
    tour_type: 'domestic',
    lead_source: '',
    tour_consultant: userProfile?.full_name || '',
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

  // Load available agents for assignment
  useEffect(() => {
    const loadAgents = async () => {
      if (!userProfile?.org_id || isAgent) {
        return; // Agents can't assign to others
      }

      try {
        setLoadingAgents(true);
        const agents = await agentService.getAgents(userProfile.org_id);
        setAvailableAgents(agents.map(agent => ({
          id: agent.id,
          name: agent.name
        })));
      } catch (error) {
        console.error('Error loading agents:', error);
        // Continue without agents
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, [userProfile?.org_id, isAgent]);

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
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const prepareInquiryData = (status: 'Draft' | 'New'): InquiryInsertData => {
    const selectedAgent = availableAgents.find(a => a.id === formData.assigned_agent);
    
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
      assigned_to: isAgent ? userProfile?.id : formData.assigned_agent || null,
      assigned_agent_name: isAgent ? userProfile?.full_name : selectedAgent?.name || null,
      created_by: userProfile?.id || null,
      status: status
    };

    return inquiryData;
  };

  const saveDraft = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const draftData = prepareInquiryData('Draft');
      
      console.log("Saving draft inquiry data:", draftData);
      await createInquiry(draftData);
      
      toast.success("Draft saved successfully!");
      navigate("/inquiries");
    } catch (error) {
      console.error("Error saving draft:", error);
      
      if (error instanceof InquiryValidationError) {
        // Validation errors are already shown by the service
        return;
      }
      
      toast.error("Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      const submittedFormData = prepareInquiryData('New');
      
      console.log("Submitting inquiry data:", submittedFormData);
      await createInquiry(submittedFormData);
      
      toast.success("Inquiry submitted successfully!");
      navigate("/inquiries");
      
    } catch (error) {
      console.error("Error creating inquiry:", error);
      
      if (error instanceof InquiryValidationError) {
        // Validation errors are already shown by the service
        return;
      }
      
      toast.error("Failed to create inquiry");
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
