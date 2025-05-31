
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRole } from "../contexts/RoleContext";
import { createInquiry } from "../services/inquiryService";
import { InquiryFormData, AvailableAgent, InquiryInsertData } from "../types/inquiry.types";

export const useInquiryForm = () => {
  const navigate = useNavigate();
  const { role, currentUser } = useRole();
  
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>('domestic');
  const [formData, setFormData] = useState<InquiryFormData>({
    tour_type: 'domestic',
    lead_source: '',
    tour_consultant: currentUser?.name || '',
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

  const availableAgents: AvailableAgent[] = [
    { id: "agent-1", name: "James Smith" },
    { id: "agent-2", name: "Sarah Johnson" },
    { id: "agent-3", name: "Robert Lee" },
    { id: "agent-4", name: "Emma Wilson" }
  ];

  const isAgent = role === 'agent';

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

    // Validate destination or custom destination
    if (!formData.destination && !formData.custom_destination?.trim()) {
      errors.push("Please select a destination or enter a custom destination");
    }

    // Validate numeric fields
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
    const inquiryData: InquiryInsertData = {
      id: crypto.randomUUID(), // Generate UUID here
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
      assigned_to: isAgent ? currentUser?.id : formData.assigned_agent || null,
      assigned_agent_name: isAgent ? currentUser?.name : 
        formData.assigned_agent ? availableAgents.find(a => a.id === formData.assigned_agent)?.name : null,
      created_by: currentUser?.id || null,
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
      
      navigate("/inquiries");
    } catch (error) {
      console.error("Error saving draft:", error);
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
      
      // Enhanced post-submission flow
      setTimeout(() => {
        navigate("/inquiries");
      }, 1500);
      
    } catch (error) {
      console.error("Error creating inquiry:", error);
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
    handleTabChange,
    saveDraft,
    handleSubmit,
    handleCancel
  };
};
