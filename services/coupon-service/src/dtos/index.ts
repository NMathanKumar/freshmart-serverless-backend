export interface UpsertCouponDto {
  couponId?: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
  maximumDiscount?: number;
  minimumOrderValue?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate?: string;
  endDate?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  customerEligibility?: 'ALL' | 'NEW_USER';
  stackable?: boolean;
  active?: boolean;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface ValidateCouponDto {
  code: string;
  customerId: string;
  orderValue: number;
  cartItems: Array<{ productId: string; categoryId?: string; quantity: number; price: number }>;
}

export interface RedeemCouponDto {
  code: string;
  customerId: string;
  orderId: string;
}
