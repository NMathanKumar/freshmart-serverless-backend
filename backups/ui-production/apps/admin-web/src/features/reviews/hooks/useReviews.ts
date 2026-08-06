import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reviewService,
  type ReviewModel,
  type ReviewListParams,
} from '../services/review.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useReviews(params: ReviewListParams = {}) {
  return useQuery<ReviewModel[], AppApiError>({
    queryKey: ['admin', 'reviews', params],
    queryFn: async () => {
      try {
        return await reviewService.listReviews(params);
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

export function useReview(id: string) {
  return useQuery<ReviewModel, AppApiError>({
    queryKey: ['admin', 'review', id],
    queryFn: async () => {
      try {
        return await reviewService.getReview(id);
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

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { id: string; status: string }>({
    mutationFn: ({ id, status }) => reviewService.updateReviewStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, string>({
    mutationFn: (id) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
}

export function useReviewStatistics() {
  return useQuery<Record<string, number>, AppApiError>({
    queryKey: ['admin', 'reviews', 'statistics'],
    queryFn: async () => {
      try {
        return await reviewService.getReviewStatistics();
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
