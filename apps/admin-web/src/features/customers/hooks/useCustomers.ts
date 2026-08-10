import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  customerService,
  type CustomerModel,
  type CustomerListParams,
} from '../services/customer.service';
import type { AdminCustomer, AdminCustomerStatus } from '@freshmart/api-sdk';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useCustomers(params: CustomerListParams = {}) {
  return useQuery<CustomerModel[], AppApiError>({
    queryKey: ['admin', 'customers', params],
    queryFn: async ({ signal }) => {
      try {
        return await customerService.listCustomers({ ...params, signal });
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

export function useCustomer(customerId: string) {
  return useQuery<CustomerModel, AppApiError>({
    queryKey: ['admin', 'customer', customerId],
    queryFn: async () => {
      try {
        return await customerService.getCustomer(customerId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!customerId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { customerId: string; status: AdminCustomerStatus }>({
    mutationFn: ({ customerId, status }) => customerService.updateCustomerStatus(customerId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { customerId: string; data: Partial<AdminCustomer> }>({
    mutationFn: ({ customerId, data }) => customerService.updateCustomer(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, Partial<AdminCustomer>>({
    mutationFn: (data) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => customerService.deleteCustomer(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'customers'] });
      queryClient.setQueriesData<CustomerModel[]>({ queryKey: ['admin', 'customers'] }, (old) =>
        old ? old.filter((c) => c.id !== deletedId) : []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });
}

export function useCustomerOrders(customerId: string) {
  return useQuery<Array<Record<string, unknown>>, AppApiError>({
    queryKey: ['admin', 'customer', 'orders', customerId],
    queryFn: async () => {
      try {
        return await customerService.getCustomerOrders(customerId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!customerId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCustomerAddresses(customerId: string) {
  return useQuery<Array<Record<string, unknown>>, AppApiError>({
    queryKey: ['admin', 'customer', 'addresses', customerId],
    queryFn: async () => {
      try {
        return await customerService.getCustomerAddresses(customerId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!customerId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCustomerStatistics() {
  return useQuery<Record<string, number>, AppApiError>({
    queryKey: ['admin', 'customers', 'statistics'],
    queryFn: async () => {
      try {
        return await customerService.getCustomerStatistics();
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
