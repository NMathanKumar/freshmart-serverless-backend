export interface HomePageView {
  heroBanners: Array<{ id: string; title: string; imageUrl: string }>;
  categories: Array<{ categoryId: string; name: string }>;
  featuredProducts: Array<{ productId: string; name: string; price: number }>;
  trendingProducts: Array<{ productId: string; name: string; price: number }>;
  offers: Array<{ code: string; title: string; discountPercentage: number }>;
  recommendedProducts: Array<{ productId: string; name: string; price: number }>;
  recentlyViewed: Array<{ productId: string; name: string }>;
  cartSummary: { itemCount: number; grandTotal: number };
}

export interface CategoriesView {
  categories: Array<Record<string, unknown>>;
}

export interface ProductDetailsView {
  product: Record<string, unknown>;
  relatedProducts: Array<Record<string, unknown>>;
  wishlistState: { isWishlisted: boolean };
}

export interface CartView {
  cart: Record<string, unknown>;
}

export interface CheckoutView {
  cart: Record<string, unknown>;
  address: Record<string, unknown> | null;
  deliveryEstimate: string;
  availablePaymentMethods: string[];
  coupons: Array<Record<string, unknown>>;
}

export interface OrdersView {
  orders: Array<Record<string, unknown>>;
}

export interface ProfileView {
  user: Record<string, unknown>;
  recentOrders: Array<Record<string, unknown>>;
  wishlistSummary: Record<string, unknown>;
  addresses: Array<Record<string, unknown>>;
}

export interface WishlistView {
  items: Array<Record<string, unknown>>;
}

export interface NotificationsView {
  notifications: Array<Record<string, unknown>>;
}
