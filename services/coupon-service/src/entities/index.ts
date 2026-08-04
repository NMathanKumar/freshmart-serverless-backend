export interface Coupon {
  couponId: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
  maximumDiscount?: number;
  minimumOrderValue?: number;
  usageLimit?: number;
  perUserLimit?: number;
  currentUsage: number;
  startDate?: string;
  endDate?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  customerEligibility?: 'ALL' | 'NEW_USER';
  stackable: boolean;
  active: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
