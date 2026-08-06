import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  suppliersService,
  type SupplierModel,
  type SupplierListParams,
  type CreateSupplierInput,
} from '../services/suppliers.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useSuppliers(params: SupplierListParams = {}) {
  return useQuery<{ items: SupplierModel[]; total: number }, AppApiError>({
    queryKey: ['admin', 'suppliers', params],
    queryFn: async () => {
      try {
        return await suppliersService.listSuppliers(params);
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

export function useSupplier(id: string) {
  return useQuery<SupplierModel, AppApiError>({
    queryKey: ['admin', 'supplier', id],
    queryFn: async () => {
      try {
        return await suppliersService.getSupplier(id);
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

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation<SupplierModel, AppApiError, CreateSupplierInput>({
    mutationFn: (input) => suppliersService.createSupplier(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { supplierId: string; input: Partial<CreateSupplierInput> }>({
    mutationFn: ({ supplierId, input }) => suppliersService.updateSupplier(supplierId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
    },
  });
}

export function useUpdateSupplierStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { supplierId: string; status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' }>({
    mutationFn: ({ supplierId, status }) => suppliersService.updateSupplierStatus(supplierId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => suppliersService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
    },
  });
}
