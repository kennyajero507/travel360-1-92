import { useState, useEffect } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export interface QuoteAnalyticsData {
  totalQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  pendingQuotes: number;
  conversionRate: number;
  averageValue: number;
  totalValue: number;
  responseTime: number;
  viewCount: number;
  downloadCount: number;
  monthlyData: any[];
}

export const useQuoteAnalytics = (dateRange?: { start: string; end: string }) => {
  const { profile } = useSimpleAuth();
  const [analytics, setAnalytics] = useState<QuoteAnalyticsData>({
    totalQuotes: 0,
    acceptedQuotes: 0,
    rejectedQuotes: 0,
    pendingQuotes: 0,
    conversionRate: 0,
    averageValue: 0,
    totalValue: 0,
    responseTime: 0,
    viewCount: 0,
    downloadCount: 0,
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!profile?.org_id) return;

    try {
      setLoading(true);

      // Build date filter
      let dateFilter = '';
      if (dateRange) {
        dateFilter = `AND created_at >= '${dateRange.start}' AND created_at <= '${dateRange.end}'`;
      }

      // Fetch quote stats
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id, status, total_amount, created_at, sent_to_client_at, client_selection_date')
        .eq('org_id', profile.org_id);

      if (quotesError) throw quotesError;

      // Fetch interaction stats
      const { data: interactions, error: interactionsError } = await supabase
        .from('quote_interactions')
        .select('interaction_type, created_at')
        .in('quote_id', quotes?.map(q => q.id) || []);

      if (interactionsError) throw interactionsError;

      // Calculate metrics
      const totalQuotes = quotes?.length || 0;
      const acceptedQuotes = quotes?.filter(q => q.status === 'approved' || q.status === 'accepted').length || 0;
      const rejectedQuotes = quotes?.filter(q => q.status === 'rejected').length || 0;
      const pendingQuotes = quotes?.filter(q => q.status === 'pending').length || 0;
      
      const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
      const totalValue = quotes?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0;
      const averageValue = totalQuotes > 0 ? totalValue / totalQuotes : 0;

      const viewCount = interactions?.filter(i => i.interaction_type === 'viewed').length || 0;
      const downloadCount = interactions?.filter(i => i.interaction_type === 'downloaded').length || 0;

      // Calculate average response time (days between sent and client response)
      const responseTimes = quotes
        ?.filter(q => q.sent_to_client_at && q.client_selection_date)
        .map(q => {
          const sent = new Date(q.sent_to_client_at!);
          const responded = new Date(q.client_selection_date!);
          return (responded.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24);
        }) || [];

      const responseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;

      // Generate monthly data for charts
      const monthlyData = generateMonthlyData(quotes || []);

      setAnalytics({
        totalQuotes,
        acceptedQuotes,
        rejectedQuotes,
        pendingQuotes,
        conversionRate,
        averageValue,
        totalValue,
        responseTime,
        viewCount,
        downloadCount,
        monthlyData
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching quote analytics:', err);
      setError('Failed to load analytics');
      toast.error('Failed to load quote analytics');
    } finally {
      setLoading(false);
    }
  };

  const logQuoteMetric = async (quoteId: string, metricName: string, metricValue?: number, metricData?: any) => {
    try {
      const { data, error } = await supabase.rpc('log_quote_metric', {
        p_quote_id: quoteId,
        p_metric_name: metricName,
        p_metric_value: metricValue,
        p_metric_data: metricData || {}
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error logging quote metric:', err);
    }
  };

  const generateMonthlyData = (quotes: any[]) => {
    const monthlyStats: { [key: string]: any } = {};
    
    quotes.forEach(quote => {
      const month = new Date(quote.created_at).toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          month,
          quotes: 0,
          accepted: 0,
          value: 0
        };
      }
      
      monthlyStats[month].quotes++;
      if (quote.status === 'approved' || quote.status === 'accepted') {
        monthlyStats[month].accepted++;
      }
      monthlyStats[month].value += quote.total_amount || 0;
    });

    return Object.values(monthlyStats).sort((a: any, b: any) => a.month.localeCompare(b.month));
  };

  useEffect(() => {
    if (profile?.org_id) {
      fetchAnalytics();
    }
  }, [profile?.org_id, dateRange]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    logQuoteMetric
  };
};