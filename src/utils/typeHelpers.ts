import { Payment, EmailTemplate } from "../types/enhanced-booking.types";
import { Booking, BookingStatus } from "../types/booking.types";
import { Invoice, InvoiceLineItem } from "../types/invoice.types";

// Type guards for safe type conversion
export const isValidPaymentStatus = (status: string): status is Payment['payment_status'] => {
  return ['pending', 'completed', 'failed', 'refunded'].includes(status);
};

export const isValidEmailTemplateType = (type: string): type is EmailTemplate['template_type'] => {
  return ['booking_confirmation', 'status_update', 'payment_reminder', 'voucher_delivery'].includes(type);
};

export const isValidBookingStatus = (status: string): status is BookingStatus => {
  return ['pending', 'confirmed', 'cancelled', 'completed'].includes(status);
};

export const isValidInvoiceStatus = (status: any): status is Invoice['status'] => {
  return ['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(status);
};

export const ensureBookingStatus = (status: any): BookingStatus => {
  if (isValidBookingStatus(status)) {
    return status;
  }
  return 'pending';
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
    status: ensureBookingStatus(data.status),
    room_arrangement: Array.isArray(data.room_arrangement) ? data.room_arrangement : [],
    transport: Array.isArray(data.transport) ? data.transport : [],
    activities: Array.isArray(data.activities) ? data.activities : [],
    transfers: Array.isArray(data.transfers) ? data.transfers : [],
  };
};

export const convertToInvoice = (data: any): Invoice => {
  const lineItems = Array.isArray(data.line_items)
    ? data.line_items.map((item: any): InvoiceLineItem => ({
        id: item.id || Math.random().toString(),
        description: item.description || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: item.total || 0,
      }))
    : [];

  return {
    ...data,
    status: isValidInvoiceStatus(data.status) ? data.status : 'draft',
    line_items: lineItems,
  };
};
