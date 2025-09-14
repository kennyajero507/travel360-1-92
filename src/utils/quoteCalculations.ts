import type { SleepingArrangement, TransportOption, TransferOption, Activity } from '../types/quote';

export interface QuoteTotals {
  accommodationTotal: number;
  transportTotal: number;
  transferTotal: number;
  activityTotal: number;
  subtotal: number;
  markupAmount: number;
  grandTotal: number;
}

export const calculateTotals = (
  sleepingArrangements: SleepingArrangement[],
  transportOptions: TransportOption[],
  transferOptions: TransferOption[],
  activities: Activity[],
  markupPercentage: number,
  durationNights: number = 1
): QuoteTotals => {
  // Ensure all inputs are arrays to prevent .reduce() errors
  const safeArrangements = Array.isArray(sleepingArrangements) ? sleepingArrangements : [];
  const safeTransportOptions = Array.isArray(transportOptions) ? transportOptions : [];
  const safeTransferOptions = Array.isArray(transferOptions) ? transferOptions : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  // Calculate accommodation costs - use cost_per_night * duration for each arrangement
  const accommodationTotal = safeArrangements.reduce((total, arrangement) => {
    // Simple calculation: cost per night * duration for this arrangement
    return total + (arrangement.cost_per_night * durationNights);
  }, 0);

  // Calculate transport costs
  const transportTotal = safeTransportOptions.reduce((total, transport) => {
    return total + (transport.total_cost || 0);
  }, 0);

  // Calculate transfer costs
  const transferTotal = safeTransferOptions.reduce((total, transfer) => {
    return total + (transfer.total_cost || 0);
  }, 0);

  // Calculate activity costs
  const activityTotal = safeActivities.reduce((total, activity) => {
    return total + (activity.total_cost || 0);
  }, 0);

  // Calculate subtotal
  const subtotal = accommodationTotal + transportTotal + transferTotal + activityTotal;

  // Calculate markup
  const markupAmount = subtotal * (markupPercentage / 100);

  // Calculate grand total
  const grandTotal = subtotal + markupAmount;

  return {
    accommodationTotal,
    transportTotal,
    transferTotal,
    activityTotal,
    subtotal,
    markupAmount,
    grandTotal
  };
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'KES': 'KSh',
    'EUR': '€',
    'GBP': '£',
    'TZS': 'TSh',
    'UGX': 'USh'
  };
  
  const symbol = symbols[currencyCode] || '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const calculateDuration = (startDate: string, endDate: string): { days: number; nights: number } => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  const nights = days - 1;
  
  return { days, nights };
};