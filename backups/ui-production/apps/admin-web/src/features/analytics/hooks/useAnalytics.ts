import { useQuery, useMutation } from '@tanstack/react-query';
import { analyticsService, type AnalyticsSummaryModel } from '../services/analytics.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useAnalyticsDashboard(period = '30d') {
  return useQuery<AnalyticsSummaryModel, AppApiError>({
    queryKey: ['admin', 'analytics', 'dashboard', period],
    queryFn: async () => {
      try {
        return await analyticsService.getAnalyticsDashboard(period);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useRevenueAnalytics(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'analytics', 'revenue', params],
    queryFn: async () => {
      try {
        return await analyticsService.getRevenueAnalytics(params);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useOrderAnalytics(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'analytics', 'orders', params],
    queryFn: async () => {
      try {
        return await analyticsService.getOrderAnalytics(params);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useProductAnalytics(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'analytics', 'products', params],
    queryFn: async () => {
      try {
        return await analyticsService.getProductAnalytics(params);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCustomerAnalytics(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'analytics', 'customers', params],
    queryFn: async () => {
      try {
        return await analyticsService.getCustomerAnalytics(params);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCategoryAnalytics(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'analytics', 'categories', params],
    queryFn: async () => {
      try {
        return await analyticsService.getCategoryAnalytics(params);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useInventoryAnalytics(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'analytics', 'inventory', params],
    queryFn: async () => {
      try {
        return await analyticsService.getInventoryAnalytics(params);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useExportAnalytics() {
  return useMutation<{ downloadUrl: string; fileName: string }, AppApiError, 'csv' | 'excel' | 'pdf'>({
    mutationFn: (format) => analyticsService.exportAnalyticsReport(format),
  });
}
