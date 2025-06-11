
import { Payment, EmailTemplate } from "../types/enhanced-booking.types";
import { Booking } from "../types/booking.types";

// Type guards for safe type conversion
export const isValidPaymentStatus = (status: string): status is Payment['payment_status'] => {
  return ['pending', 'completed', 'failed', 'refunded'].includes(status);
};

export const isValidEmailTemplateType = (type: string): type is EmailTemplate['template_type'] => {
  return ['booking_confirmation', 'status_update', 'payment_reminder', 'voucher_delivery'].includes(type);
};

export const isValidBookingStatus = (status: string): status is Booking['status'] => {
  return ['pending', 'confirmed', 'cancelled', 'completed'].includes(status);
};

// Safe type converters for database responses
export const convertToPayment = (data: any): Payment => {
  return {
    ...data,
    payment_status: isValidPaymentStatus(data.payment_status) ? data.payment_status : 'pending',
  };
};

export const convertToEmailTemplate = (data: any): EmailTemplate => {
  return {
    ...data,
    template_type: isValidEmailTemplateType(data.template_type) ? data.template_type : 'booking_confirmation',
  };
};

export const convertToBooking = (data: any): Booking => {
  return {
    ...data,
    status: isValidBookingStatus(data.status) ? data.status : 'pending',
    room_arrangement: Array.isArray(data.room_arrangement) ? data.room_arrangement : [],
    transport: Array.isArray(data.transport) ? data.transport : [],
    activities: Array.isArray(data.activities) ? data.activities : [],
    transfers: Array.isArray(data.transfers) ? data.transfers : [],
  };
};
