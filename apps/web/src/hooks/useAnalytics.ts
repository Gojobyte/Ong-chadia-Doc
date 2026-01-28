import { useQuery } from '@tanstack/react-query';
import * as analyticsService from '@/services/analytics.service';
import type { Period } from '@/services/analytics.service';

// 5 minute refresh interval for analytics
const REFRESH_INTERVAL = 5 * 60 * 1000;

export function useStorageAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'storage'],
    queryFn: analyticsService.getStorageAnalytics,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  });
}

export function useUploadAnalytics(period: Period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'uploads', period],
    queryFn: () => analyticsService.getUploadAnalytics(period),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  });
}

export function useTypeAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'types'],
    queryFn: analyticsService.getTypeAnalytics,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  });
}

export function useFolderAnalytics(limit: number = 5) {
  return useQuery({
    queryKey: ['analytics', 'folders', limit],
    queryFn: () => analyticsService.getFolderAnalytics(limit),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  });
}

export function useUserAnalytics(limit: number = 5, period: Period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'users', limit, period],
    queryFn: () => analyticsService.getUserAnalytics(limit, period),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  });
}
