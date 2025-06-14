
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface AnalyticsData {
  totalQuotes: number;
  totalBookings: number;
  totalInvoices: number;
  totalRevenue: number;
  monthlyQuotes: number;
  monthlyBookings: number;
  monthlyRevenue: number;
  conversionRate: number;
  averageQuoteValue: number;
  topDestinations: Array<{ destination: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: 'quote' | 'booking' | 'invoice';
    description: string;
    created_at: string;
    amount?: number;
  }>;
}

export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get current month boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch quotes data
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*');
      
      if (quotesError) throw quotesError;

      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');
      
      if (bookingsError) throw bookingsError;

      // Fetch invoices data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*');
      
      if (invoicesError) throw invoicesError;

      // Calculate metrics
      const totalQuotes = quotes?.length || 0;
      const totalBookings = bookings?.length || 0;
      const totalInvoices = invoices?.length || 0;
      
      const totalRevenue = bookings?.reduce((sum, booking) => {
        const price = Number(booking.total_price) || 0;
        return sum + price;
      }, 0) || 0;
      
      const monthlyQuotes = quotes?.filter(q => 
        new Date(q.created_at) >= startOfMonth && new Date(q.created_at) <= endOfMonth
      ).length || 0;
      
      const monthlyBookings = bookings?.filter(b => 
        new Date(b.created_at) >= startOfMonth && new Date(b.created_at) <= endOfMonth
      ).length || 0;
      
      const monthlyRevenue = bookings?.filter(b => 
        new Date(b.created_at) >= startOfMonth && new Date(b.created_at) <= endOfMonth
      ).reduce((sum, booking) => {
        const price = Number(booking.total_price) || 0;
        return sum + price;
      }, 0) || 0;
      
      const conversionRate = totalQuotes > 0 ? (totalBookings / totalQuotes) * 100 : 0;
      const averageQuoteValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Get top destinations with proper typing
      const destinationCounts: Record<string, number> = {};
      bookings?.forEach(booking => {
        const dest = booking.hotel_name || 'Unknown';
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      });
      
      const topDestinations = Object.entries(destinationCounts)
        .map(([destination, count]) => ({ destination, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get recent activity
      const recentActivity = [
        ...(quotes?.slice(-5).map(q => ({
          id: q.id,
          type: 'quote' as const,
          description: `Quote created for ${q.client}`,
          created_at: q.created_at,
        })) || []),
        ...(bookings?.slice(-5).map(b => ({
          id: b.id,
          type: 'booking' as const,
          description: `Booking confirmed for ${b.client}`,
          created_at: b.created_at,
          amount: Number(b.total_price) || 0
        })) || []),
        ...(invoices?.slice(-5).map(i => ({
          id: i.id,
          type: 'invoice' as const,
          description: `Invoice ${i.invoice_number} created`,
          created_at: i.created_at,
          amount: Number(i.amount) || 0
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

      setData({
        totalQuotes,
        totalBookings,
        totalInvoices,
        totalRevenue,
        monthlyQuotes,
        monthlyBookings,
        monthlyRevenue,
        conversionRate,
        averageQuoteValue,
        topDestinations,
        recentActivity
      });
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics
  };
};
