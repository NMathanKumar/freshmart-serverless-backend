import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  categoryService,
  type CategoryModel,
  type CategoryListParams,
  type CreateCategoryInput,
} from '../services/category.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useCategories(params: CategoryListParams = {}) {
  return useQuery<CategoryModel[], AppApiError>({
    queryKey: ['admin', 'categories', params],
    queryFn: async () => {
      try {
        return await categoryService.listCategories(params);
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

export function useCategory(categoryId: string) {
  return useQuery<CategoryModel, AppApiError>({
    queryKey: ['admin', 'category', categoryId],
    queryFn: async () => {
      try {
        return await categoryService.getCategory(categoryId);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: !!categoryId,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<CategoryModel, AppApiError, CreateCategoryInput>({
    mutationFn: (input) => categoryService.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<CategoryModel, AppApiError, { id: string; input: Partial<CreateCategoryInput> }>({
    mutationFn: ({ id, input }) => categoryService.updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'categories'] });
      queryClient.setQueriesData<CategoryModel[]>({ queryKey: ['admin', 'categories'] }, (old) =>
        old ? old.filter((c) => c.id !== deletedId) : []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

export function useUploadCategoryImage() {
  return useMutation<{ uploadUrl: string; imageUrl: string }, AppApiError, { fileName: string; contentType: string }>({
    mutationFn: ({ fileName, contentType }) => categoryService.uploadCategoryImage(fileName, contentType),
  });
}
