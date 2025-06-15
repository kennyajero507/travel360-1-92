
import { useState } from 'react';
import { InquiryFormData } from '../types/inquiry.types';

export const useInquiryValidation = () => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (formData: InquiryFormData): boolean => {
    const errors: string[] = [];

    if (!formData.client_name.trim()) {
      errors.push('Client name is required');
    }

    if (!formData.client_mobile.trim()) {
      errors.push('Client mobile is required');
    }

    if (!formData.destination.trim()) {
      errors.push('Destination is required');
    }

    if (!formData.check_in_date) {
      errors.push('Check-in date is required');
    }

    if (!formData.check_out_date) {
      errors.push('Check-out date is required');
    }

    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      
      if (checkOut <= checkIn) {
        errors.push('Check-out date must be after check-in date');
      }
    }

    if (formData.adults < 1) {
      errors.push('At least 1 adult is required');
    }

    if (formData.num_rooms < 1) {
      errors.push('At least 1 room is required');
    }

    // International specific validations
    if (formData.tour_type === 'international') {
      if (formData.visa_required && !formData.passport_expiry_date) {
        errors.push('Passport expiry date is required when visa is needed');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  return { validationErrors, setValidationErrors, validateForm };
};
