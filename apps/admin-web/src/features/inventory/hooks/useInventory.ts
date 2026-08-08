import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  inventoryService,
  type InventoryModel,
  type MovementModel,
  type InventoryListParams,
  type MovementListParams,
  type AdjustmentPayload,
} from '../services/inventory.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useInventory(params: InventoryListParams = {}) {
  return useQuery<InventoryModel[], AppApiError>({
    queryKey: ['admin', 'inventory', params],
    queryFn: async ({ signal }) => {
      try {
        return await inventoryService.listInventory({ ...params, signal });
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

export function useInventoryItem(productId: string) {
  return useQuery<InventoryModel, AppApiError>({
    queryKey: ['admin', 'inventory', productId],
    queryFn: async () => {
      try {
        return await inventoryService.getInventory(productId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!productId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation<InventoryModel, AppApiError, { productId: string; stock: number; minStock?: number; unit?: string }>({
    mutationFn: ({ productId, stock, minStock, unit }) =>
      inventoryService.updateInventory(productId, stock, minStock, unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { productId: string; stock: number }>({
    mutationFn: ({ productId, stock }) => inventoryService.updateStock(productId, stock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => inventoryService.deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
    },
  });
}

export function useLowStock() {
  return useQuery<InventoryModel[], AppApiError>({
    queryKey: ['admin', 'inventory', 'low-stock'],
    queryFn: async () => {
      try {
        return await inventoryService.getLowStock();
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

export function useMovements(params: MovementListParams = {}) {
  return useQuery<MovementModel[], AppApiError>({
    queryKey: ['admin', 'inventory', 'movements', params],
    queryFn: async () => {
      try {
        return await inventoryService.listAllMovements(params);
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

export function useInventoryHistory(productId: string, params: MovementListParams = {}) {
  return useQuery<MovementModel[], AppApiError>({
    queryKey: ['admin', 'inventory', 'history', productId, params],
    queryFn: async () => {
      try {
        return await inventoryService.getInventoryHistory(productId, params);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!productId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation<InventoryModel, AppApiError, { productId: string; payload: AdjustmentPayload }>({
    mutationFn: ({ productId, payload }) => inventoryService.adjustStock(productId, payload),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'movements'] });
    },
  });
}

export function useAdjustDamage() {
  const queryClient = useQueryClient();
  return useMutation<InventoryModel, AppApiError, { productId: string; payload: AdjustmentPayload }>({
    mutationFn: ({ productId, payload }) => inventoryService.adjustDamage(productId, payload),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'movements'] });
    },
  });
}

export function useAdjustExpired() {
  const queryClient = useQueryClient();
  return useMutation<InventoryModel, AppApiError, { productId: string; payload: AdjustmentPayload }>({
    mutationFn: ({ productId, payload }) => inventoryService.adjustExpired(productId, payload),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'movements'] });
    },
  });
}

export function useAdjustReturn() {
  const queryClient = useQueryClient();
  return useMutation<InventoryModel, AppApiError, { productId: string; payload: AdjustmentPayload }>({
    mutationFn: ({ productId, payload }) => inventoryService.adjustReturn(productId, payload),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'movements'] });
    },
  });
}

export function useApproveAdjustment() {
  const queryClient = useQueryClient();
  return useMutation<InventoryModel, AppApiError, { productId: string; movementId: string; remarks?: string }>({
    mutationFn: ({ productId, movementId, remarks }) => inventoryService.approveAdjustment(productId, movementId, remarks),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'movements'] });
    },
  });
}

export function useRejectAdjustment() {
  const queryClient = useQueryClient();
  return useMutation<InventoryModel, AppApiError, { productId: string; movementId: string; remarks?: string }>({
    mutationFn: ({ productId, movementId, remarks }) => inventoryService.rejectAdjustment(productId, movementId, remarks),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'history', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'movements'] });
    },
  });
}
