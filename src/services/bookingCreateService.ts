
// Patch for build - no actual booking creation until table exists
export const bookingCreateService = {
  createBooking: async (data: any) => {
    return { success: false, error: "Booking functionality not implemented (table missing)." };
  }
};
