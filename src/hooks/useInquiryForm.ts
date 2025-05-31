
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRole } from "../contexts/RoleContext";
import { createInquiry } from "../services/inquiryService";
import { InquiryFormData, AvailableAgent } from "../types/inquiry.types";

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

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.client_name.trim()) {
      errors.push("Client Name is required");
    }
    
    if (!formData.client_mobile.trim()) {
      errors.push("Mobile Number is required");
    }
    
    if (!formData.check_in_date) {
      errors.push("Check-in Date is required");
    }
    
    if (!formData.check_out_date) {
      errors.push("Check-out Date is required");
    }
    
    if (formData.check_in_date && formData.check_out_date) {
      if (new Date(formData.check_out_date) <= new Date(formData.check_in_date)) {
        errors.push("Check-out date must be after check-in date");
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const saveDraft = async () => {
    try {
      const draftData = { 
        ...formData,
        assigned_to: isAgent ? currentUser?.id : formData.assigned_agent,
        assigned_agent_name: isAgent ? currentUser?.name : 
          formData.assigned_agent ? availableAgents.find(a => a.id === formData.assigned_agent)?.name : null,
        created_by: currentUser?.id,
        status: "Draft"
      };
      
      console.log("Saving draft inquiry data:", draftData);
      await createInquiry(draftData);
      
      toast.success("Draft saved successfully!");
      navigate("/inquiries");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      const submittedFormData = { 
        ...formData,
        assigned_to: isAgent ? currentUser?.id : formData.assigned_agent,
        assigned_agent_name: isAgent ? currentUser?.name : 
          formData.assigned_agent ? availableAgents.find(a => a.id === formData.assigned_agent)?.name : null,
        created_by: currentUser?.id,
        status: "New"
      };
      
      console.log("Submitting inquiry data:", submittedFormData);
      await createInquiry(submittedFormData);
      
      toast.success("Inquiry created successfully!");
      navigate("/inquiries");
    } catch (error) {
      console.error("Error creating inquiry:", error);
      toast.error("Failed to create inquiry. Please try again.");
    }
  };

  return {
    activeTab,
    formData,
    setFormData,
    validationErrors,
    availableAgents,
    isAgent,
    handleTabChange,
    saveDraft,
    handleSubmit,
    navigate
  };
};
