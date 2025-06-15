
// Real analytics can now be implemented, but for now, return safe zeroes.
export const useAnalytics = () => {
  return {
    quoteCount: 0,
    bookingCount: 0,
    invoiceCount: 0,
    bookingRevenue: 0,
    invoiceRevenue: 0,
    topHotels: [],
    topClients: [],
    mostRecentInvoice: null,
    isLoading: false,
    isError: false,
  };
};
