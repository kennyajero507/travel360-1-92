
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInquiryFormData } from './useInquiryFormData';
import { useInquiryValidation } from './useInquiryValidation';
import { useInquirySubmission } from './useInquirySubmission';
import { useInquiryAgents } from './useInquiryAgents';

export const useInquiryForm = () => {
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>('domestic');
  const navigate = useNavigate();

  const { formData, setFormData } = useInquiryFormData();
  const { validationErrors, validateForm } = useInquiryValidation();
  const { isSubmitting, submitInquiry } = useInquirySubmission();
  const { availableAgents, loadingAgents, isAgent } = useInquiryAgents();

  const handleTabChange = (value: string) => {
    const newTab = value as 'domestic' | 'international';
    setActiveTab(newTab);
    setFormData(prev => ({ ...prev, tour_type: newTab }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    await submitInquiry(formData, 'New');
  };

  const saveDraft = async () => {
    await submitInquiry(formData, 'Draft');
  };

  const handleCancel = () => {
    navigate('/inquiries');
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
