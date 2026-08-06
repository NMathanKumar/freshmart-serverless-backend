import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  purchaseOrderService,
  type PurchaseOrderModel,
  type PurchaseOrderListParams,
  type CreatePurchaseOrderInput,
} from '../services/purchase-order.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function usePurchaseOrders(params: PurchaseOrderListParams = {}) {
  return useQuery<{ items: PurchaseOrderModel[]; total: number }, AppApiError>({
    queryKey: ['admin', 'purchase-orders', params],
    queryFn: async () => {
      try {
        return await purchaseOrderService.listPurchaseOrders(params);
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

export function usePurchaseOrder(id: string) {
  return useQuery<PurchaseOrderModel, AppApiError>({
    queryKey: ['admin', 'purchase-order', id],
    queryFn: async () => {
      try {
        return await purchaseOrderService.getPurchaseOrder(id);
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

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<PurchaseOrderModel, AppApiError, CreatePurchaseOrderInput>({
    mutationFn: (input) => purchaseOrderService.createPurchaseOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchase-orders'] });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { id: string; input: Partial<CreatePurchaseOrderInput> }>({
    mutationFn: ({ id, input }) => purchaseOrderService.updatePurchaseOrder(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchase-orders'] });
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => purchaseOrderService.submitPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchase-orders'] });
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { id: string; notes?: string }>({
    mutationFn: ({ id, notes }) => purchaseOrderService.approvePurchaseOrder(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchase-orders'] });
    },
  });
}

export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => purchaseOrderService.rejectPurchaseOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchase-orders'] });
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => purchaseOrderService.cancelPurchaseOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchase-orders'] });
    },
  });
}
