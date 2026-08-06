import { freshmartSdk } from '../../../lib/sdk';
import type { AdminCoupon } from '@freshmart/api-sdk';

export interface CouponModel {
  id: string;
  code: string;
  name: string;
  discount: string;
  rawDiscount: number;
  type: 'Percentage' | 'Flat' | 'Free Delivery';
  minSpend: string;
  usageCount: number;
  maxUsage: number;
  expiresAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SCHEDULED';
  statusText: string;
  statusBadgeBg: string;
  statusBadgeColor: string;
}

export interface CouponListParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateCouponInput {
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderValue?: number;
  usageLimit?: number;
  validUntil?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

function mapDiscountType(dt: string): CouponModel['type'] {
  if (dt === 'FIXED') return 'Flat';
  if (dt === 'FREE_SHIPPING') return 'Free Delivery';
  return 'Percentage';
}

function formatDiscount(type: string, value: number): string {
  if (type === 'FIXED') return `$${value} OFF`;
  if (type === 'FREE_SHIPPING') return 'FREE DELIVERY';
  return `${value}% OFF`;
}

function statusBadge(status: string): { statusText: string; statusBadgeBg: string; statusBadgeColor: string } {
  switch (status) {
    case 'ACTIVE':
      return { statusText: 'Active', statusBadgeBg: 'bg-[#e6f7ec]', statusBadgeColor: 'text-[#04883b]' };
    case 'EXPIRED':
      return { statusText: 'Expired', statusBadgeBg: 'bg-amber-50', statusBadgeColor: 'text-amber-700' };
    case 'DELETED':
      return { statusText: 'Deleted', statusBadgeBg: 'bg-rose-50', statusBadgeColor: 'text-rose-700' };
    default:
      return { statusText: 'Inactive', statusBadgeBg: 'bg-slate-100', statusBadgeColor: 'text-slate-600' };
  }
}

function toCouponModel(c: AdminCoupon): CouponModel {
  const badge = statusBadge(c.status);
  return {
    id: c.couponId,
    code: c.code,
    name: c.title,
    discount: formatDiscount(c.discountType, c.discountValue),
    rawDiscount: c.discountValue,
    type: mapDiscountType(c.discountType),
    minSpend: c.minimumOrderValue ? `$${c.minimumOrderValue}` : '-',
    usageCount: c.currentUsage,
    maxUsage: c.usageLimit ?? 0,
    expiresAt: c.endDate ? new Date(c.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing',
    status: c.status as CouponModel['status'],
    ...badge,
  };
}

export class CouponService {
  async listCoupons(params: CouponListParams = {}): Promise<CouponModel[]> {
    const res = await freshmartSdk.admin.listCoupons(params as Record<string, unknown>);
    const rawItems: AdminCoupon[] = (res as any)?.items ?? [];
    let mapped = rawItems.map(toCouponModel);

    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      mapped = mapped.filter(
        (c) => c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
      );
    }

    if (params.status && params.status !== 'All Status') {
      mapped = mapped.filter((c) => c.statusText === params.status);
    }

    return mapped;
  }

  async getCoupon(id: string): Promise<CouponModel> {
    const res = await freshmartSdk.admin.getCoupon(id);
    const c = (res as any)?.data ?? res;
    return toCouponModel(c as AdminCoupon);
  }

  async createCoupon(input: CreateCouponInput): Promise<CouponModel> {
    const res = await freshmartSdk.admin.createCoupon({
      code: input.code,
      title: input.name,
      discountType: input.discountType.toUpperCase() as AdminCoupon['discountType'],
      discountValue: input.discountValue,
      minimumOrderValue: input.minOrderValue,
      usageLimit: input.usageLimit,
      endDate: input.validUntil,
      active: input.status !== 'INACTIVE',
    });
    const c = (res as any)?.data ?? res;
    return toCouponModel(c as AdminCoupon);
  }

  async updateCoupon(id: string, input: Partial<CreateCouponInput>): Promise<void> {
    await freshmartSdk.admin.updateCoupon(id, {
      code: input.code,
      title: input.name,
      discountType: input.discountType?.toUpperCase() as AdminCoupon['discountType'] | undefined,
      discountValue: input.discountValue,
      minimumOrderValue: input.minOrderValue,
      usageLimit: input.usageLimit,
      endDate: input.validUntil,
      active: input.status !== 'INACTIVE',
    });
  }
}

export const couponService = new CouponService();
