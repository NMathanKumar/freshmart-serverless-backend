import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  notificationService,
  type NotificationModel,
  type NotificationListParams,
} from '../services/notification.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useNotifications(params: NotificationListParams = {}) {
  return useQuery<NotificationModel[], AppApiError>({
    queryKey: ['admin', 'notifications', params],
    queryFn: async () => {
      try {
        return await notificationService.listNotifications(params);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });
}

export function useNotification(id: string) {
  return useQuery<NotificationModel, AppApiError>({
    queryKey: ['admin', 'notification', id],
    queryFn: async () => {
      try {
        return await notificationService.getNotification(id);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!id,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => notificationService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => notificationService.archiveNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useNotificationStatistics() {
  return useQuery<Record<string, number>, AppApiError>({
    queryKey: ['admin', 'notifications', 'statistics'],
    queryFn: async () => {
      try {
        return await notificationService.getNotificationStatistics();
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
