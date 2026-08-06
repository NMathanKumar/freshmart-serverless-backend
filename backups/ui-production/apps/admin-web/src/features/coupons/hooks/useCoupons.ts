import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  couponService,
  type CouponModel,
  type CouponListParams,
  type CreateCouponInput,
} from '../services/coupon.service';
import { parseApiError, type AppApiError } from '../../../lib/api-error';

export function useCoupons(params: CouponListParams = {}) {
  return useQuery<CouponModel[], AppApiError>({
    queryKey: ['admin', 'coupons', params],
    queryFn: async () => {
      try {
        return await couponService.listCoupons(params);
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

export function useCoupon(id: string) {
  return useQuery<CouponModel, AppApiError>({
    queryKey: ['admin', 'coupon', id],
    queryFn: async () => {
      try {
        return await couponService.getCoupon(id);
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

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation<CouponModel, AppApiError, CreateCouponInput>({
    mutationFn: (input) => couponService.createCoupon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation<void, AppApiError, { id: string; input: Partial<CreateCouponInput> }>({
    mutationFn: ({ id, input }) => couponService.updateCoupon(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}
