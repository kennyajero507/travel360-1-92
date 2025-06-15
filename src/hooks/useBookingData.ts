
// Patch: remove usage of bookings table, all hooks become safe stubs
export const useBookingData = () => {
  return {
    bookings: [],
    isLoading: false,
    error: null,
    createBooking: async () => {
      throw new Error("Booking functionality not implemented (table missing).");
    }
  };
};
