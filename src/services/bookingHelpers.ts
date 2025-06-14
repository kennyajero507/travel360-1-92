
import {
  RoomArrangement,
  BookingTransport,
  BookingActivity,
  BookingTransfer,
} from "../types/booking.types";

// Helper: parse "JSON" field if typeof is string
export function parseJsonArray<T>(val: any): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      return Array.isArray(arr) ? arr as T[] : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Helper function to calculate quote total
export const calculateQuoteTotal = (quote: any): number => {
  const accommodationTotal = quote.room_arrangements?.reduce((sum: number, room: any) => sum + (room.total || 0), 0) || 0;
  const transportTotal = quote.transports?.reduce((sum: number, transport: any) => sum + (transport.total_cost || 0), 0) || 0;
  const transferTotal = quote.transfers?.reduce((sum: number, transfer: any) => sum + (transfer.total || 0), 0) || 0;
  const activityTotal = quote.activities?.reduce((sum: number, activity: any) => sum + (activity.total_cost || 0), 0) || 0;

  const subtotal = accommodationTotal + transportTotal + transferTotal + activityTotal;

  let markupAmount = 0;
  if (quote.markup_type === 'percentage') {
    markupAmount = (subtotal * (quote.markup_value || 0)) / 100;
  } else {
    markupAmount = quote.markup_value || 0;
  }

  return subtotal + markupAmount;
};
