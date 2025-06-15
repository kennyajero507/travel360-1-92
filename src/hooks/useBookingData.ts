
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAllBookings } from '../services/bookingReadService';
import { updateBookingStatus as apiUpdateStatus } from '../services/bookingUpdateService';
import { bookingCreateService } from '../services/bookingCreateService';
import { enhancedBookingService } from '../services/enhancedBookingService';
import { Booking, BookingStatus } from '../types/booking.types';
import { useState } from 'react';

export const useBookingData = () => {
  const queryClient = useQueryClient();

  // Fetching bookings
  const { data: bookings = [], isLoading, error } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: getAllBookings,
  });

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => apiUpdateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(`Booking status updated to ${variables.status}.`);
    },
    onError: (err: any) => {
      toast.error(`Failed to update status: ${err.message}`);
    },
  });

  // Mutation for creating a booking
  const createBookingMutation = useMutation({
    mutationFn: (newBooking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => bookingCreateService.createBooking(newBooking),
    onSuccess: (result) => {
        if (result.success) {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Booking created successfully!');
        } else {
            toast.error(`Failed to create booking: ${result.error}`);
        }
    },
    onError: (err: any) => {
      toast.error(`Failed to create booking: ${err.message}`);
    },
  });

  // Bulk actions
  const bulkUpdateStatusMutation = useMutation({
      mutationFn: ({ ids, status }: { ids: string[]; status: BookingStatus }) => enhancedBookingService.bulkUpdateStatus(ids, status),
      onSuccess: (result) => {
          if(result.success) {
              queryClient.invalidateQueries({ queryKey: ['bookings'] });
              toast.success(`${result.processedCount} booking(s) updated.`);
          } else {
              toast.error(`Bulk update failed: ${result.error}`);
          }
      },
      onError: (err: any) => {
          toast.error(`Bulk update failed: ${err.message}`);
      }
  });

  const bulkDeleteMutation = useMutation({
      mutationFn: (ids: string[]) => enhancedBookingService.bulkDelete(ids),
      onSuccess: (result) => {
          if (result.success) {
              queryClient.invalidateQueries({ queryKey: ['bookings'] });
              toast.success(`${result.processedCount} booking(s) deleted.`);
          } else {
              toast.error(`Bulk delete failed: ${result.error}`);
          }
      },
      onError: (err: any) => {
          toast.error(`Bulk delete failed: ${err.message}`);
      }
  });

  // State for selections
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  
  return {
    bookings,
    isLoading,
    error,
    updateBookingStatus: updateStatusMutation.mutate,
    createBooking: createBookingMutation.mutateAsync,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    selectedBookings,
    setSelectedBookings,
  };
};
