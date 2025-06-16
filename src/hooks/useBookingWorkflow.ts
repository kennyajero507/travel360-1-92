
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EnhancedBookingWorkflow } from '../services/enhancedBookingWorkflow';
import { Booking, BookingStatus } from '../types/booking.types';

export const useBookingWorkflow = () => {
  const queryClient = useQueryClient();

  const createBookingMutation = useMutation({
    mutationFn: (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => 
      EnhancedBookingWorkflow.createBookingWithValidation(bookingData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast.success('Booking created successfully!');
      } else {
        toast.error(`Failed to create booking: ${result.error}`);
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to create booking: ${error.message}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status, notes }: { 
      bookingId: string; 
      status: BookingStatus; 
      notes?: string; 
    }) => EnhancedBookingWorkflow.updateBookingStatus(bookingId, status, notes),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast.success(`Booking status updated to ${variables.status}`);
      } else {
        toast.error(`Failed to update status: ${result.error}`);
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const checkEligibilityMutation = useMutation({
    mutationFn: (quoteId: string) => EnhancedBookingWorkflow.checkBookingEligibility(quoteId),
  });

  return {
    createBooking: createBookingMutation.mutateAsync,
    updateBookingStatus: updateStatusMutation.mutateAsync,
    checkBookingEligibility: checkEligibilityMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    isCheckingEligibility: checkEligibilityMutation.isPending,
  };
};
