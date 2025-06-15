
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { enhancedBookingService } from "../../services/enhancedBookingService";
import { Loader } from "lucide-react";

interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  conversionRate: number;
  averageBookingValue: number;
  statusBreakdown: Record<string, number>;
  monthlyTrends: Array<{ month: string; bookings: number; revenue: number }>;
  revenueBySource: Record<string, number>;
}

const initialAnalytics: BookingAnalytics = {
  totalBookings: 0,
  totalRevenue: 0,
  conversionRate: 0,
  averageBookingValue: 0,
  statusBreakdown: {},
  monthlyTrends: [],
  revenueBySource: {},
};

const BookingAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<BookingAnalytics>(initialAnalytics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch analytics from backend (stub for now)
    setAnalytics(initialAnalytics); // Set initial/dummy data
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="animate-spin h-6 w-6 mr-2" />
        Loading analytics...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>Total Bookings: {analytics.totalBookings}</div>
          <div>Total Revenue: ${analytics.totalRevenue.toFixed(2)}</div>
          <div>Conversion Rate: {analytics.conversionRate}%</div>
          <div>Average Booking Value: ${analytics.averageBookingValue.toFixed(2)}</div>
        </div>
        {/* Optionally render more dashboards for trends here */}
      </CardContent>
    </Card>
  );
};

export default BookingAnalyticsDashboard;
