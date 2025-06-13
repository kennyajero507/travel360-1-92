
import { BookingStatus, PaymentStatus, RoomArrangement, BookingTransport, BookingActivity, BookingTransfer } from "../types/booking.types";

// Utility functions for transforming database Json types to TypeScript interfaces
export const parseJsonField = <T>(field: any, defaultValue: T): T => {
  if (field === null || field === undefined) {
    return defaultValue;
  }
  
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  
  if (Array.isArray(field) || typeof field === 'object') {
    return field as T;
  }
  
  return defaultValue;
};

export const transformRoomArrangements = (data: any): RoomArrangement[] => {
  return parseJsonField(data, []).map((room: any) => ({
    room_type: room.room_type || '',
    adults: room.adults || 0,
    children_with_bed: room.children_with_bed || 0,
    children_no_bed: room.children_no_bed || 0,
    infants: room.infants || 0,
    num_rooms: room.num_rooms || 1,
    rate_per_night: room.rate_per_night || 0,
    total: room.total || 0
  }));
};

export const transformTransports = (data: any): BookingTransport[] => {
  return parseJsonField(data, []).map((transport: any) => ({
    mode: transport.mode || '',
    route: transport.route || '',
    operator: transport.operator,
    cost_per_person: transport.cost_per_person || 0,
    num_passengers: transport.num_passengers || 0,
    total_cost: transport.total_cost || 0,
    description: transport.description,
    notes: transport.notes
  }));
};

export const transformActivities = (data: any): BookingActivity[] => {
  return parseJsonField(data, []).map((activity: any) => ({
    name: activity.name || '',
    description: activity.description,
    date: activity.date,
    cost_per_person: activity.cost_per_person || 0,
    num_people: activity.num_people || 0,
    total_cost: activity.total_cost || 0
  }));
};

export const transformTransfers = (data: any): BookingTransfer[] => {
  return parseJsonField(data, []).map((transfer: any) => ({
    type: transfer.type || '',
    from: transfer.from || '',
    to: transfer.to || '',
    vehicle_type: transfer.vehicle_type,
    cost_per_vehicle: transfer.cost_per_vehicle || 0,
    num_vehicles: transfer.num_vehicles || 1,
    total: transfer.total || 0,
    description: transfer.description
  }));
};

export const safeParseBookingStatus = (status: any): BookingStatus => {
  const validStatuses: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];
  return validStatuses.includes(status) ? status : 'pending';
};

export const safeParsePaymentStatus = (status: any): PaymentStatus => {
  const validStatuses: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded'];
  return validStatuses.includes(status) ? status : 'pending';
};
