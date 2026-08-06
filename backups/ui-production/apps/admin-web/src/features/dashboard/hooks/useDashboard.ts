import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardModel } from '../services/dashboard.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useDashboardData() {
  return useQuery<DashboardModel, AppApiError>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      try {
        return await dashboardService.getDashboardData();
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
