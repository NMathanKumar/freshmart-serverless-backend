import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  orderService,
  type OrderModel,
  type OrderListParams,
} from '../services/order.service';
import type { AdminOrder, AdminOrderStatus } from '@freshmart/api-sdk';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useOrders(params: OrderListParams = {}) {
  return useQuery<OrderModel[], AppApiError>({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      try {
        return await orderService.listOrders(params);
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

export function useOrder(orderId: string) {
  return useQuery<OrderModel, AppApiError>({
    queryKey: ['admin', 'order', orderId],
    queryFn: async () => {
      try {
        return await orderService.getOrder(orderId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!orderId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { orderId: string; status: AdminOrderStatus }>({
    mutationFn: ({ orderId, status }) => orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { orderId: string; data: Partial<AdminOrder> }>({
    mutationFn: ({ orderId, data }) => orderService.updateOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => orderService.deleteOrder(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'orders'] });
      queryClient.setQueriesData<OrderModel[]>({ queryKey: ['admin', 'orders'] }, (old) =>
        old ? old.filter((o) => o.id !== deletedId) : []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useOrderTimeline(orderId: string) {
  return useQuery<Array<{ status: string; timestamp: string; note?: string }>, AppApiError>({
    queryKey: ['admin', 'order', 'timeline', orderId],
    queryFn: async () => {
      try {
        return await orderService.getOrderTimeline(orderId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!orderId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useInvoice(orderId: string) {
  return useQuery<{ invoiceUrl: string; invoiceNumber: string }, AppApiError>({
    queryKey: ['admin', 'order', 'invoice', orderId],
    queryFn: async () => {
      try {
        return await orderService.getInvoice(orderId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!orderId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useOrderStatistics() {
  return useQuery<Record<string, number>, AppApiError>({
    queryKey: ['admin', 'orders', 'statistics'],
    queryFn: async () => {
      try {
        return await orderService.getOrderStatistics();
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
