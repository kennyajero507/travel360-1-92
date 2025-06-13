
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllBookings, getBookingById, updateBookingStatus, createBookingFromQuote } from '../services/bookingService';
import { toast } from 'sonner';

export const useBookingData = () => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: getAllBookings,
  });

  const createBooking = async (quoteId: string, hotelId: string) => {
    try {
      console.log('[useBookingData] Creating booking from quote:', quoteId, hotelId);
      
      const booking = await createBookingFromQuote(quoteId, hotelId);
      
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      return booking;
    } catch (error) {
      console.error('[useBookingData] Error in createBooking:', error);
      throw error;
    }
  };

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      console.log('[useBookingData] Updating booking status:', bookingId, status);
      
      // Validate status type
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid booking status: ${status}`);
      }
      
      await updateBookingStatus(bookingId, status as any);
      
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (error) {
      console.error('[useBookingData] Error in updateStatus:', error);
      throw error;
    }
  };

  return {
    bookings: bookings || [],
    isLoading,
    error,
    createBooking,
    updateStatus
  };
};
