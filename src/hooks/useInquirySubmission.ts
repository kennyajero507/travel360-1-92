
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { createInquiry } from '../services/inquiry';
import { InquiryFormData, InquiryInsertData } from '../types/inquiry.types';
import { useAuth } from '../contexts/AuthContext';

export const useInquirySubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const submitInquiry = async (formData: InquiryFormData, status: string = 'New') => {
    if (!user || !profile) {
      toast.error('You must be logged in to create an inquiry');
      return false;
    }

    setIsSubmitting(true);

    try {
      const inquiryData: InquiryInsertData = {
        id: uuidv4(),
        org_id: profile.org_id,
        tour_type: formData.tour_type,
        lead_source: formData.lead_source || null,
        tour_consultant: formData.tour_consultant || null,
        client_name: formData.client_name,
        client_email: formData.client_email || null,
        client_mobile: formData.client_mobile,
        destination: formData.destination,
        package_name: formData.package_name || null,
        custom_package: formData.custom_package || null,
        custom_destination: formData.custom_destination || null,
        description: formData.description || null,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        num_rooms: formData.num_rooms || 1,
        priority: formData.priority || null,
        assigned_to: formData.assigned_agent || null,
        created_by: user.id,
        status: status,
        // Enhanced fields
        visa_required: formData.visa_required || null,
        passport_expiry_date: formData.passport_expiry_date || null,
        preferred_currency: formData.preferred_currency || null,
        flight_preference: formData.flight_preference || null,
        travel_insurance_required: formData.travel_insurance_required || null,
        regional_preference: formData.regional_preference || null,
        transport_mode_preference: formData.transport_mode_preference || null,
        guide_language_preference: formData.guide_language_preference || null,
        estimated_budget_range: formData.estimated_budget_range || null,
        special_requirements: formData.special_requirements || null,
        document_checklist: formData.document_checklist || null,
        workflow_stage: formData.workflow_stage || 'initial',
      };

      await createInquiry(inquiryData);
      
      const message = status === 'Draft' ? 'Inquiry saved as draft' : 'Inquiry created successfully';
      toast.success(message);
      
      navigate('/inquiries');
      return true;
    } catch (error) {
      console.error('Error creating inquiry:', error);
      toast.error('Failed to create inquiry');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitInquiry };
};
