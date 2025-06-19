
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInquiryFormData } from './useInquiryFormData';
import { useInquiryValidation } from './useInquiryValidation';
import { useInquirySubmission } from './useInquirySubmission';

export const useInquiryForm = () => {
  const navigate = useNavigate();

  const { formData, setFormData } = useInquiryFormData();
  const { validationErrors, validateForm } = useInquiryValidation();
  const { isSubmitting, submitInquiry } = useInquirySubmission();

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
    formData,
    setFormData,
    validationErrors,
    isSubmitting,
    handleSubmit,
    saveDraft,
    handleCancel
  };
};
