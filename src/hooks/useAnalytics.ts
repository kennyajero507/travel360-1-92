
// Patch this hook so it does not reference missing tables, for build only
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
