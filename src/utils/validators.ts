
import { z } from 'zod';

// Hotel validation schemas
export const hotelValidationSchema = z.object({
  name: z.string().min(1, 'Hotel name is required').max(100, 'Hotel name too long'),
  destination: z.string().min(1, 'Destination is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Active', 'Inactive']),
  location: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export const roomTypeValidationSchema = z.object({
  name: z.string().min(1, 'Room type name is required'),
  maxOccupancy: z.number().min(1, 'Max occupancy must be at least 1').max(20, 'Max occupancy too high'),
  bedOptions: z.string().min(1, 'Bed options are required'),
  ratePerNight: z.number().min(0, 'Rate cannot be negative'),
  ratePerPersonPerNight: z.number().min(0, 'Rate cannot be negative').optional(),
  totalUnits: z.number().min(1, 'Must have at least 1 unit').max(1000, 'Too many units'),
  amenities: z.array(z.string()).default([]),
  isOutOfOrder: z.boolean().default(false),
});

// Client validation schemas
export const clientValidationSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  location: z.string().optional(),
});

// Inquiry validation schemas
export const inquiryValidationSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Invalid email address').optional(),
  client_mobile: z.string().min(1, 'Mobile number is required'),
  destination: z.string().min(1, 'Destination is required'),
  check_in_date: z.string().min(1, 'Check-in date is required'),
  check_out_date: z.string().min(1, 'Check-out date is required'),
  adults: z.number().min(1, 'Must have at least 1 adult'),
  children: z.number().min(0, 'Children count cannot be negative'),
  infants: z.number().min(0, 'Infants count cannot be negative'),
});

// Quote validation schemas
export const quoteValidationSchema = z.object({
  client: z.string().min(1, 'Client is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  destination: z.string().min(1, 'Destination is required'),
  adults: z.number().min(1, 'Must have at least 1 adult'),
});

// Validation helper functions
export const validateField = <T>(schema: z.ZodSchema<T>, data: any): { success: boolean; errors: string[] } => {
  try {
    schema.parse(data);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation - adjust based on requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};
