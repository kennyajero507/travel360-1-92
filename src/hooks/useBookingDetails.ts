
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookingById } from '../services/bookingReadService';
import { updateBookingStatus } from '../services/bookingUpdateService';
import { BookingStatus } from '../types/booking.types';
import { toast } from 'sonner';
import { convertToBooking } from '../utils/typeHelpers';

export const useBookingDetails = (bookingId?: string) => {
  const queryClient = useQueryClient();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const data = await getBookingById(bookingId);
      return data ? convertToBooking(data) : null;
    },
    enabled: !!bookingId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: BookingStatus) => {
      if (!bookingId) throw new Error("Booking ID is missing");
      return updateBookingStatus(bookingId, status);
    },
    onSuccess: (_, status) => {
      toast.success(`Booking status updated to ${status}.`);
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] }); // Invalidate list view as well
    },
    onError: (err: any) => {
      toast.error(`Failed to update status: ${err.message}`);
    },
  });

  return {
    booking,
    isLoading,
    isError,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};
