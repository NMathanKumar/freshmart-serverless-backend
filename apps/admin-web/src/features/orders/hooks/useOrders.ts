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
    queryFn: async ({ signal }) => {
      try {
        return await orderService.listOrders({ ...params, signal });
      } catch (err) {
        throw parseApiError(err);
      }
    },
    staleTime: 5000,
    gcTime: 300000,
    refetchInterval: 5000,
    retry: 1,
    refetchOnWindowFocus: true,
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
  return useMutation<void, AppApiError, { orderId: string; status: AdminOrderStatus }, { previousQueries: Array<[readonly unknown[], unknown]> }>({
    mutationFn: ({ orderId, status }) => orderService.updateOrderStatus(orderId, status),
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'orders'] });
      const previousQueries = queryClient.getQueriesData<OrderModel[]>({ queryKey: ['admin', 'orders'] });

      queryClient.setQueriesData<OrderModel[]>({ queryKey: ['admin', 'orders'] }, (old) => {
        if (!old) return [];
        return old.map((ord) => {
          if (ord.id === orderId || ord.id === `#${orderId}` || ord.id.replace(/^#/, '') === orderId.replace(/^#/, '')) {
            let orderStatusFormatted: OrderModel['orderStatus'] = 'DELIVERED';
            let statusBadgeText = 'Delivered';
            let statusBadgeBg = 'bg-[#e6f7ec]';
            let statusBadgeColor = 'text-[#04883b]';

            if (status === 'PREPARING' || status === 'ACCEPTED') {
              orderStatusFormatted = 'PROCESSING';
              statusBadgeText = 'Processing';
              statusBadgeBg = 'bg-teal-50';
              statusBadgeColor = 'text-teal-600';
            } else if (status === 'READY') {
              orderStatusFormatted = 'SHIPPED';
              statusBadgeText = 'Shipped';
              statusBadgeBg = 'bg-blue-50';
              statusBadgeColor = 'text-blue-600';
            } else if (status === 'PLACED') {
              orderStatusFormatted = 'PENDING';
              statusBadgeText = 'Pending';
              statusBadgeBg = 'bg-amber-50';
              statusBadgeColor = 'text-amber-600';
            } else if (status === 'CANCELLED') {
              orderStatusFormatted = 'CANCELLED';
              statusBadgeText = 'Cancelled';
              statusBadgeBg = 'bg-rose-50';
              statusBadgeColor = 'text-rose-600';
            }

            return {
              ...ord,
              orderStatus: orderStatusFormatted,
              rawOrderStatus: status,
              statusBadgeText,
              statusBadgeBg,
              statusBadgeColor,
            };
          }
          return ord;
        });
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
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
