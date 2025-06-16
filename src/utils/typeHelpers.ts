
import { BookingStatus } from '../types/booking.types';

export const ensureBookingStatus = (status: string): BookingStatus => {
  const validStatuses: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];
  
  if (validStatuses.includes(status as BookingStatus)) {
    return status as BookingStatus;
  }
  
  // Default to pending if status is invalid
  console.warn(`Invalid booking status: ${status}, defaulting to pending`);
  return 'pending';
};

export const isValidBookingStatus = (status: string): status is BookingStatus => {
  const validStatuses: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];
  return validStatuses.includes(status as BookingStatus);
};

// Enhanced type helpers for admin types
export const ensureOrganizationStatus = (status: string): 'active' | 'suspended' | 'inactive' => {
  const validStatuses = ['active', 'suspended', 'inactive'];
  if (validStatuses.includes(status)) {
    return status as 'active' | 'suspended' | 'inactive';
  }
  return 'active';
};

export const ensureSubscriptionStatus = (status: string): 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended' => {
  const validStatuses = ['trial', 'active', 'past_due', 'canceled', 'suspended'];
  if (validStatuses.includes(status)) {
    return status as 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
  }
  return 'trial';
};

export const ensureSystemEventSeverity = (severity: string): 'low' | 'medium' | 'high' | 'critical' => {
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (validSeverities.includes(severity)) {
    return severity as 'low' | 'medium' | 'high' | 'critical';
  }
  return 'low';
};

export const convertToBooking = (data: any) => {
  return {
    ...data,
    status: ensureBookingStatus(data.status),
    room_arrangement: typeof data.room_arrangement === 'string' 
      ? JSON.parse(data.room_arrangement) 
      : data.room_arrangement || [],
    transport: typeof data.transport === 'string' 
      ? JSON.parse(data.transport) 
      : data.transport || [],
    activities: typeof data.activities === 'string' 
      ? JSON.parse(data.activities) 
      : data.activities || [],
    transfers: typeof data.transfers === 'string' 
      ? JSON.parse(data.transfers) 
      : data.transfers || []
  };
};

export const convertToInvoice = (data: any) => {
  return {
    ...data,
    line_items: typeof data.line_items === 'string' 
      ? JSON.parse(data.line_items) 
      : data.line_items || []
  };
};

export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  // Use Kenya Shilling formatting as default
  if (currency === 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
