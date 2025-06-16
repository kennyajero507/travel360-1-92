
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

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
