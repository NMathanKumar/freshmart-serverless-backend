import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productService,
  type ProductModel,
  type ProductListParams,
  type CreateProductInput,
} from '../services/product.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useProducts(params: ProductListParams = {}) {
  return useQuery<ProductModel[], AppApiError>({
    queryKey: ['admin', 'products', params],
    queryFn: async ({ signal }) => {
      try {
        return await productService.listProducts({ ...params, signal });
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

export function useProduct(productId: string) {
  return useQuery<ProductModel, AppApiError>({
    queryKey: ['admin', 'product', productId],
    queryFn: async () => {
      try {
        return await productService.getProduct(productId);
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

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<ProductModel, AppApiError, CreateProductInput>({
    mutationFn: (input) => productService.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<ProductModel, AppApiError, { id: string; input: Partial<CreateProductInput> }>({
    mutationFn: ({ id, input }) => productService.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => productService.deleteProduct(id),
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['admin', 'products'] });

      // Optimistically update all matching product queries
      queryClient.setQueriesData<ProductModel[]>({ queryKey: ['admin', 'products'], exact: false }, (old) =>
        old ? old.filter((p) => p.id !== deletedId) : []
      );
    },
    onSettled: () => {
      // Re-sync with real backend database
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useUploadProductImage() {
  return useMutation<{ uploadUrl: string; imageUrl: string }, AppApiError, { fileName: string; contentType: string }>({
    mutationFn: ({ fileName, contentType }) => productService.uploadProductImage(fileName, contentType),
  });
}
