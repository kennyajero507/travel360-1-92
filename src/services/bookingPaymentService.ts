
// Patch: remove references to "payments" table which does not exist
// All functions here will throw or no-op

export const getPaymentsByBooking = async (bookingId: string) => {
  // Payments table not available, return empty
  return [];
};

export const recordPayment = async (payment) => {
  throw new Error("Payments functionality is not implemented (table missing).");
};
