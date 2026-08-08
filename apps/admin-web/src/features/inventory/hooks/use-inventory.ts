import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, type InventoryListParams, type InventoryModel } from '../services/inventory.service';

export const useInventory = (params: InventoryListParams = {}) => {
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.listInventory(params)
  });

  const updateInventoryMutation = useMutation({
    mutationFn: (data: { sku: string; payload: any }) => inventoryService.updateInventory(data.sku, data.payload.currentStock, data.payload.minimumStock, data.payload.unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  return {
    inventory: inventoryQuery.data || [],
    isLoading: inventoryQuery.isLoading,
    isError: inventoryQuery.isError,
    updateInventory: updateInventoryMutation.mutateAsync,
    refetch: inventoryQuery.refetch,
    state: (inventoryQuery.isLoading ? 'loading' : inventoryQuery.isError ? 'error' : 'ready') as 'loading' | 'ready' | 'error' | 'empty'
  };
};
