import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService, type ReportItemModel, type ReportListParams } from '../services/reports.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useReports(params: ReportListParams = {}) {
  return useQuery<ReportItemModel[], AppApiError>({
    queryKey: ['admin', 'reports', params],
    queryFn: async () => {
      try {
        return await reportsService.listReports(params);
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

export function useSalesReport(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'reports', 'sales', params],
    queryFn: async () => {
      try {
        return await reportsService.getSalesReport(params);
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

export function useOrdersReport(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'reports', 'orders', params],
    queryFn: async () => {
      try {
        return await reportsService.getOrdersReport(params);
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

export function useCustomersReport(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'reports', 'customers', params],
    queryFn: async () => {
      try {
        return await reportsService.getCustomersReport(params);
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

export function useInventoryReport(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'reports', 'inventory', params],
    queryFn: async () => {
      try {
        return await reportsService.getInventoryReport(params);
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

export function useProductsReport(params: Record<string, unknown> = {}) {
  return useQuery<Record<string, unknown>, AppApiError>({
    queryKey: ['admin', 'reports', 'products', params],
    queryFn: async () => {
      try {
        return await reportsService.getProductsReport(params);
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

export function useExportReport() {
  const queryClient = useQueryClient();
  return useMutation<
    { reportId: string; downloadUrl: string; fileName: string },
    AppApiError,
    { reportType: string; format: 'csv' | 'excel' | 'pdf'; dateRange?: string }
  >({
    mutationFn: (payload) => reportsService.exportReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

export function useDownloadReport() {
  return useMutation<{ downloadUrl: string; fileName: string }, AppApiError, string>({
    mutationFn: (reportId) => reportsService.downloadReport(reportId),
  });
}
