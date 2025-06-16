
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';

export const useAnalyticsData = () => {
  const { organization } = useAuth();
  const orgId = organization?.id;

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['analytics', orgId],
    queryFn: () => orgId ? analyticsService.getAnalyticsData(orgId) : null,
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  return {
    analyticsData,
    isLoading,
    error,
    refetch
  };
};
