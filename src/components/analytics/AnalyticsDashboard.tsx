
import React from "react";
import { useAnalytics } from "../../hooks/useAnalytics";

const AnalyticsDashboard = () => {
  const {
    quoteCount,
    bookingCount,
    invoiceCount,
    bookingRevenue,
    invoiceRevenue,
    topHotels,
    topClients,
    mostRecentInvoice,
    isLoading,
    isError,
  } = useAnalytics();

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }
  if (isError) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <p>Total Quotes: {quoteCount}</p>
      <p>Total Bookings: {bookingCount}</p>
      <p>Total Invoices: {invoiceCount}</p>
      <p>Booking Revenue: {bookingRevenue}</p>
      <p>Invoice Revenue: {invoiceRevenue}</p>
    </div>
  );
};

export default AnalyticsDashboard;
