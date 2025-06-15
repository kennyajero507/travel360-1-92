
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export const useBookingAnalytics = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['booking-analytics'],
    queryFn: async () => {
      // Get total bookings count
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Get bookings by status
      const { data: statusData } = await supabase
        .from('bookings')
        .select('status')
        .order('created_at', { ascending: false });

      // Calculate status distribution
      const statusCounts = statusData?.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_price')
        .not('total_price', 'is', null);

      const totalRevenue = revenueData?.reduce((sum, booking) => 
        sum + (booking.total_price || 0), 0) || 0;

      // Get recent bookings for growth calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: previousBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', thirtyDaysAgo.toISOString());

      // Calculate growth rate
      const currentMonthBookings = recentBookings || 0;
      const previousMonthBookings = previousBookings || 0;
      const bookingGrowth = previousMonthBookings > 0 
        ? ((currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100 
        : currentMonthBookings > 0 ? 100 : 0;

      // Get average booking value
      const averageBookingValue = totalBookings && totalBookings > 0 
        ? totalRevenue / totalBookings 
        : 0;

      return {
        totalBookings: totalBookings || 0,
        totalRevenue,
        averageBookingValue,
        bookingGrowth,
        statusDistribution: statusCounts,
        pendingBookings: statusCounts.pending || 0,
        confirmedBookings: statusCounts.confirmed || 0,
        completedBookings: statusCounts.completed || 0,
        cancelledBookings: statusCounts.cancelled || 0,
      };
    },
  });

  return {
    analytics: analytics || {
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      bookingGrowth: 0,
      statusDistribution: {},
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
    },
    isLoading,
    error,
  };
};
