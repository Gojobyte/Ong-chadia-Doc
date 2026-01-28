import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDashboard,
  getDashboardActivity,
  type DashboardData,
  type ActivityResponse,
} from '@/services/dashboard.service';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes (matches API cache)
const REFETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch dashboard aggregated data
 * Auto-refreshes every 5 minutes
 */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Hook to fetch dashboard activity with pagination
 */
export function useDashboardActivity(page: number = 1, limit: number = 10) {
  return useQuery<ActivityResponse>({
    queryKey: ['dashboard', 'activity', page, limit],
    queryFn: () => getDashboardActivity(page, limit),
    staleTime: STALE_TIME,
  });
}

/**
 * Hook to manually refresh dashboard data
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  };
}
