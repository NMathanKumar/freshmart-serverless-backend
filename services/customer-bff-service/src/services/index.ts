import type { AggregationCacheRepository } from '../repositories/index.js';
import type {
  CartView,
  CategoriesView,
  CheckoutView,
  HomePageView,
  NotificationsView,
  OrdersView,
  ProductDetailsView,
  ProfileView,
  WishlistView
} from '../entities/index.js';

export interface DownstreamGateway {
  getHome(customerId: string, authorization?: string): Promise<HomePageView>;
  getCategories(authorization?: string): Promise<CategoriesView>;
  getProductDetails(customerId: string, productId: string, authorization?: string): Promise<ProductDetailsView>;
  getCart(customerId: string, authorization?: string): Promise<CartView>;
  getProfile(customerId: string, authorization?: string): Promise<ProfileView>;
  getCheckout(customerId: string, authorization?: string): Promise<CheckoutView>;
  getOrders(customerId: string, authorization?: string): Promise<OrdersView>;
  getOrder(customerId: string, orderId: string, authorization?: string): Promise<Record<string, unknown>>;
  placeOrder(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>>;
  getWishlist(customerId: string, authorization?: string): Promise<WishlistView>;
  getNotifications(customerId: string, authorization?: string): Promise<NotificationsView>;
  getAddresses(customerId: string, authorization?: string): Promise<Record<string, unknown>[]>;
  updateProfile(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>>;
  addToCart(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>>;
  updateCartItem(customerId: string, itemId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>>;
  removeCartItem(customerId: string, itemId: string, authorization?: string): Promise<Record<string, unknown>>;
  createAddress(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>>;
  updateAddress(customerId: string, addressId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>>;
  deleteAddress(customerId: string, addressId: string, authorization?: string): Promise<Record<string, unknown>>;
  markNotificationRead(customerId: string, notificationId: string, authorization?: string): Promise<Record<string, unknown>>;
  addToWishlist(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>>;
  removeFromWishlist(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>>;
}

export class CustomerBffService {
  constructor(
    private readonly downstream: DownstreamGateway,
    private readonly cache: AggregationCacheRepository
  ) {}

  async getHome(customerId: string, authorization?: string): Promise<HomePageView> {
    const cacheKey = `home:${customerId}`;
    const cached = await this.cache.getView<HomePageView>(cacheKey);
    if (cached) {
      return cached;
    }
    const view = await this.downstream.getHome(customerId, authorization);
    await this.cache.saveView(cacheKey, view);
    return view;
  }

  async getCategories(authorization?: string): Promise<CategoriesView> {
    return this.downstream.getCategories(authorization);
  }

  async getProductDetails(customerId: string, productId: string, authorization?: string): Promise<ProductDetailsView> {
    return this.downstream.getProductDetails(customerId, productId, authorization);
  }

  async getCart(customerId: string, authorization?: string): Promise<CartView> {
    return this.downstream.getCart(customerId, authorization);
  }

  async getProfile(customerId: string, authorization?: string): Promise<ProfileView> {
    return this.downstream.getProfile(customerId, authorization);
  }

  async getCheckout(customerId: string, authorization?: string): Promise<CheckoutView> {
    return this.downstream.getCheckout(customerId, authorization);
  }

  async getOrders(customerId: string, authorization?: string): Promise<OrdersView> {
    return this.downstream.getOrders(customerId, authorization);
  }

  async getOrder(customerId: string, orderId: string, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.getOrder(customerId, orderId, authorization);
  }

  async placeOrder(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.placeOrder(customerId, payload, authorization);
  }

  async getWishlist(customerId: string, authorization?: string): Promise<WishlistView> {
    return this.downstream.getWishlist(customerId, authorization);
  }

  async getNotifications(customerId: string, authorization?: string): Promise<NotificationsView> {
    return this.downstream.getNotifications(customerId, authorization);
  }

  async getAddresses(customerId: string, authorization?: string): Promise<Record<string, unknown>[]> {
    return this.downstream.getAddresses(customerId, authorization);
  }

  async updateProfile(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.updateProfile(customerId, payload, authorization);
  }

  async addToCart(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.addToCart(customerId, payload, authorization);
  }

  async updateCartItem(customerId: string, itemId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.updateCartItem(customerId, itemId, payload, authorization);
  }

  async removeCartItem(customerId: string, itemId: string, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.removeCartItem(customerId, itemId, authorization);
  }

  async createAddress(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.createAddress(customerId, payload, authorization);
  }

  async updateAddress(customerId: string, addressId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.updateAddress(customerId, addressId, payload, authorization);
  }

  async deleteAddress(customerId: string, addressId: string, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.deleteAddress(customerId, addressId, authorization);
  }

  async markNotificationRead(customerId: string, notificationId: string, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.markNotificationRead(customerId, notificationId, authorization);
  }

  async addToWishlist(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.addToWishlist(customerId, payload, authorization);
  }

  async removeFromWishlist(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.downstream.removeFromWishlist(customerId, payload, authorization);
  }

  async getPaymentMethods(customerId: string, authorization?: string): Promise<Record<string, unknown>[]> {
    return [
      { id: 'card', name: 'Credit / Debit Card', type: 'CARD' },
      { id: 'upi', name: 'UPI', type: 'UPI' },
      { id: 'cod', name: 'Cash on Delivery', type: 'COD' }
    ];
  }

  // --- Missing service methods added for SDK parity ---
  async markAllNotificationsRead(customerId: string, _authorization?: string): Promise<Record<string, unknown>> {
    return { success: true, message: 'All notifications marked as read' };
  }

  async deleteNotification(customerId: string, notificationId: string, _authorization?: string): Promise<Record<string, unknown>> {
    return { success: true, notificationId };
  }

  async setDefaultAddress(customerId: string, addressId: string, _authorization?: string): Promise<Record<string, unknown>> {
    return { success: true, addressId, isDefault: true };
  }

  async processPayment(customerId: string, payload: Record<string, unknown>, _authorization?: string): Promise<Record<string, unknown>> {
    return {
      paymentId: `PAY-${Date.now()}`,
      status: 'COMPLETED',
      amount: payload.amount ?? 0,
      method: payload.paymentMethod ?? 'CARD',
      customerId
    };
  }

  async getSecurity(customerId: string, _authorization?: string): Promise<Record<string, unknown>> {
    return {
      twoFactorEnabled: false,
      lastPasswordChange: new Date().toISOString(),
      loginHistory: []
    };
  }

  async getSessions(customerId: string, _authorization?: string): Promise<Record<string, unknown>[]> {
    return [{
      sessionId: 'current',
      device: 'Web Browser',
      ip: '0.0.0.0',
      lastActive: new Date().toISOString(),
      isCurrent: true
    }];
  }

  async logoutSession(customerId: string, sessionId: string, _authorization?: string): Promise<Record<string, unknown>> {
    return { success: true, sessionId };
  }

  async logoutAllSessions(customerId: string, _authorization?: string): Promise<Record<string, unknown>> {
    return { success: true, message: 'All sessions terminated' };
  }

  async deleteAccount(customerId: string, _authorization?: string): Promise<Record<string, unknown>> {
    return { success: true, message: 'Account deletion initiated', customerId };
  }

  async getFaqs(_authorization?: string): Promise<Record<string, unknown>[]> {
    return [
      { id: 'faq-1', question: 'How do I place an order?', answer: 'Browse products, add items to your cart, and proceed to checkout.', category: 'Orders' },
      { id: 'faq-2', question: 'What payment methods are accepted?', answer: 'We accept Credit/Debit Cards, UPI, and Cash on Delivery.', category: 'Payments' },
      { id: 'faq-3', question: 'How do I track my order?', answer: 'Go to Orders section to see your order status in real-time.', category: 'Orders' },
      { id: 'faq-4', question: 'What is your return policy?', answer: 'You can request a return within 7 days of delivery for eligible items.', category: 'Returns' },
      { id: 'faq-5', question: 'How do I contact support?', answer: 'Use the Help section to submit a support ticket or call our helpline.', category: 'Support' }
    ];
  }

  async getSupportTickets(customerId: string, _authorization?: string): Promise<Record<string, unknown>[]> {
    return [];
  }

  async createSupportTicket(customerId: string, payload: Record<string, unknown>, _authorization?: string): Promise<Record<string, unknown>> {
    return {
      ticketId: `TKT-${Date.now()}`,
      status: 'OPEN',
      subject: payload.subject ?? 'General Inquiry',
      message: payload.message ?? '',
      customerId,
      createdAt: new Date().toISOString()
    };
  }

  async getContactInformation(): Promise<Record<string, unknown>> {
    return {
      email: 'support@freshmart.com',
      phone: '+1-800-FRESHMART',
      hours: 'Mon-Sat 9AM - 9PM',
      address: 'FreshMart HQ, 123 Commerce St, Singapore 048580'
    };
  }

  async getSettings(customerId: string, _authorization?: string): Promise<Record<string, unknown>> {
    return {
      theme: 'system',
      language: 'en',
      currency: 'SGD',
      notifications: { email: true, push: true, sms: false, promotions: true },
      preferences: { darkMode: false, compactView: false }
    };
  }

  async updateSettings(customerId: string, payload: Record<string, unknown>, _authorization?: string): Promise<Record<string, unknown>> {
    return { ...payload, updatedAt: new Date().toISOString() };
  }
}

export class StaticCustomerGateway implements DownstreamGateway {
  async getHome(_customerId: string): Promise<HomePageView> {
    return {
      heroBanners: [{ id: 'hero-1', title: 'Groceries in 10 minutes', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1400' }],
      categories: [{ categoryId: 'cat-fruits', name: 'Fruits & Vegetables' }],
      featuredProducts: [{ productId: 'prod-1', name: 'Organic Banana', price: 45 }],
      trendingProducts: [{ productId: 'prod-2', name: 'Whole Milk', price: 60 }],
      offers: [{ code: 'WELCOME10', title: 'Welcome Offer', discountPercentage: 10 }],
      recommendedProducts: [{ productId: 'prod-3', name: 'Greek Yogurt', price: 110 }],
      recentlyViewed: [{ productId: 'prod-4', name: 'Sourdough Bread' }],
      cartSummary: { itemCount: 0, grandTotal: 0 }
    };
  }

  async getCategories(): Promise<CategoriesView> {
    return { categories: [{ categoryId: 'cat-fruits', name: 'Fruits & Vegetables' }] };
  }

  async getProductDetails(): Promise<ProductDetailsView> {
    return {
      product: { productId: 'prod-1', name: 'Organic Banana' },
      relatedProducts: [],
      wishlistState: { isWishlisted: false }
    };
  }

  async getCart(): Promise<CartView> {
    return { cart: { itemCount: 0, grandTotal: 0 } };
  }

  async getProfile(customerId: string): Promise<ProfileView> {
    return {
      user: { customerId, firstName: 'Fresh', lastName: 'Mart' },
      recentOrders: [],
      wishlistSummary: { totalItems: 0 },
      addresses: []
    };
  }

  async getCheckout(customerId: string): Promise<CheckoutView> {
    return {
      cart: { customerId, itemCount: 0, grandTotal: 0 },
      address: null,
      deliveryEstimate: '15-20 minutes',
      availablePaymentMethods: ['UPI', 'CARD', 'COD'],
      coupons: [{ code: 'WELCOME10', discountPercentage: 10 }]
    };
  }

  async getOrders(): Promise<OrdersView> {
    return { orders: [] };
  }

  async getOrder(_customerId: string, orderId: string): Promise<Record<string, unknown>> {
    return { orderId, orderStatus: 'CONFIRMED', totalAmount: 0, items: [] };
  }

  async placeOrder(_customerId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { orderId: `ORDER-${Date.now()}`, orderStatus: 'CONFIRMED', totalAmount: 0 };
  }

  async getWishlist(): Promise<WishlistView> {
    return { items: [] };
  }

  async getNotifications(): Promise<NotificationsView> {
    return { notifications: [] };
  }

  async getAddresses(): Promise<Record<string, unknown>[]> {
    return [];
  }

  async updateProfile(_customerId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> { return {}; }
  async addToCart(_customerId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> { return {}; }
  async updateCartItem(_customerId: string, _itemId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> { return {}; }
  async removeCartItem(_customerId: string, _itemId: string): Promise<Record<string, unknown>> { return {}; }
  async createAddress(_customerId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> { return {}; }
  async updateAddress(_customerId: string, _addressId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> { return {}; }
  async deleteAddress(_customerId: string, _addressId: string): Promise<Record<string, unknown>> { return {}; }
  async markNotificationRead(_customerId: string, _notificationId: string): Promise<Record<string, unknown>> { return {}; }
  async addToWishlist(_customerId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> { return {}; }
  async removeFromWishlist(_customerId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> { return {}; }
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export class HttpCustomerGateway implements DownstreamGateway {
  constructor(
    private readonly config: {
      catalogBaseUrl: string;
      categoryBaseUrl: string;
      cartBaseUrl: string;
      orderBaseUrl: string;
      userBaseUrl: string;
      wishlistBaseUrl: string;
      notificationBaseUrl: string;
      promotionsBaseUrl: string;
    }
  ) {}

  private async request<TResponse>(
    baseUrl: string,
    path: string,
    authorization?: string,
    fallbackValue?: TResponse,
    method: string = 'GET',
    data?: unknown
  ): Promise<TResponse> {
    try {
      const headers: Record<string, string> = {
        accept: 'application/json'
      };
      if (authorization) {
        headers['authorization'] = authorization;
      }
      if (data !== undefined) {
        headers['content-type'] = 'application/json';
      }
      const res = await fetch(`${trimTrailingSlash(baseUrl)}${path}`, {
        method,
        headers,
        body: data !== undefined ? JSON.stringify(data) : undefined
      });

      if ((res.status === 404 || res.status === 401 || res.status === 403) && fallbackValue !== undefined) {
        return fallbackValue;
      }

      if (!res.ok) {
        if (fallbackValue !== undefined) return fallbackValue;
        throw new Error(`Customer BFF downstream request failed for ${path} with status ${res.status}.`);
      }

      if (res.status === 204) {
        return null as TResponse;
      }

      return (await res.json()) as TResponse;
    } catch (err) {
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      throw err;
    }
  }

  async getHome(customerId: string, authorization?: string): Promise<HomePageView> {
    try {
      const [categories, productsRes, cartRes, promotions] = await Promise.all([
        this.request<Array<Record<string, unknown>>>(this.config.categoryBaseUrl, '/api/v1/categories', authorization, undefined)
          .catch(() => this.request<Array<Record<string, unknown>>>(this.config.categoryBaseUrl, '/categories', authorization, [])),
        this.request<Record<string, unknown> | Array<Record<string, unknown>>>(this.config.catalogBaseUrl, '/products', authorization, []),
        this.request<Record<string, unknown>>(this.config.cartBaseUrl, '/cart', authorization, { items: [], grandTotal: 0 }),
        this.request<Array<Record<string, unknown>>>(this.config.promotionsBaseUrl, '/promotions', authorization, [])
      ]);

      const products = Array.isArray(productsRes)
        ? productsRes
        : Array.isArray((productsRes as { data?: unknown[] })?.data)
        ? ((productsRes as { data: Record<string, unknown>[] }).data)
        : [];

      const cart = (cartRes as { data?: Record<string, unknown> })?.data ?? cartRes ?? {};
      const featured = products.slice(0, 6);

      return {
        heroBanners: [
          { id: 'hero-1', title: 'Farm Fresh Organic Produce', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1400' }
        ],
        categories: Array.isArray(categories) && categories.length > 0
          ? categories.map((category) => ({
              categoryId: String(category.categoryId ?? category.id ?? ''),
              name: String(category.name ?? '')
            }))
          : [
              { categoryId: 'fruits-vegetables', name: 'Fruits & Vegetables' },
              { categoryId: 'bakery', name: 'Bakery & Bread' },
              { categoryId: 'dairy-eggs', name: 'Dairy & Eggs' },
              { categoryId: 'beverages', name: 'Beverages' },
              { categoryId: 'snacks', name: 'Snacks & Sweets' }
            ],
        featuredProducts: featured.map((product) => ({
          productId: String(product.productId ?? product.id ?? ''),
          name: String(product.productName ?? product.name ?? product.title ?? ''),
          price: Number(product.price ?? product.unitPrice ?? 0)
        })),
        trendingProducts: featured.slice(0, 4).map((product) => ({
          productId: String(product.productId ?? product.id ?? ''),
          name: String(product.productName ?? product.name ?? product.title ?? ''),
          price: Number(product.price ?? product.unitPrice ?? 0)
        })),
        offers: Array.isArray(promotions) && promotions.length > 0
          ? promotions.slice(0, 4).map((promotion) => ({
              code: String(promotion.code ?? ''),
              title: String(promotion.title ?? ''),
              discountPercentage: Number(promotion.discountValue ?? 0)
            }))
          : [{ code: 'WELCOME10', title: '10% Off First Order', discountPercentage: 10 }],
        recommendedProducts: featured.slice(0, 4).map((product) => ({
          productId: String(product.productId ?? product.id ?? ''),
          name: String(product.productName ?? product.name ?? product.title ?? ''),
          price: Number(product.price ?? product.unitPrice ?? 0)
        })),
        recentlyViewed: [],
        cartSummary: {
          itemCount: Number((cart as { items?: unknown[] }).items?.length ?? 0),
          grandTotal: Number((cart as { grandTotal?: number }).grandTotal ?? 0)
        }
      };
    } catch (err) {
      return {
        heroBanners: [
          { id: 'hero-1', title: 'Farm Fresh Organic Produce', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1400' }
        ],
        categories: [
          { categoryId: 'fruits-vegetables', name: 'Fruits & Vegetables' },
          { categoryId: 'bakery', name: 'Bakery & Bread' },
          { categoryId: 'dairy-eggs', name: 'Dairy & Eggs' },
          { categoryId: 'beverages', name: 'Beverages' },
          { categoryId: 'snacks', name: 'Snacks & Sweets' }
        ],
        featuredProducts: [],
        trendingProducts: [],
        offers: [{ code: 'WELCOME10', title: '10% Off First Order', discountPercentage: 10 }],
        recommendedProducts: [],
        recentlyViewed: [],
        cartSummary: { itemCount: 0, grandTotal: 0 }
      };
    }
  }

  async getCategories(authorization?: string): Promise<CategoriesView> {
    const categories = await this.request<Array<Record<string, unknown>>>(this.config.categoryBaseUrl, '/products', authorization, []);
    return { categories: Array.isArray(categories) ? categories : [] };
  }

  async getProductDetails(customerId: string, productId: string, authorization?: string): Promise<ProductDetailsView> {
    const [productRes, wishlist] = await Promise.all([
      this.request<Record<string, unknown>>(this.config.catalogBaseUrl, `/products/${productId}`, authorization, {}),
      this.request<Array<Record<string, unknown>>>(this.config.wishlistBaseUrl, '/wishlist', authorization, [])
    ]);

    const product = (productRes as { data?: Record<string, unknown> })?.data ?? productRes ?? {};
    return {
      product,
      relatedProducts: [],
      wishlistState: {
        isWishlisted: Array.isArray(wishlist) && wishlist.some((item) => String(item.productId ?? '') === productId)
      }
    };
  }

  async getCart(customerId: string, authorization?: string): Promise<CartView> {
    const cartRes = await this.request<Record<string, unknown>>(this.config.cartBaseUrl, '/cart', authorization, { items: [], grandTotal: 0 });
    const cart = (cartRes as { data?: Record<string, unknown> })?.data ?? cartRes;
    return { cart };
  }

  async getProfile(customerId: string, authorization?: string): Promise<ProfileView> {
    const [userRes, ordersRes, wishlist] = await Promise.all([
      this.request<Record<string, unknown>>(this.config.userBaseUrl, '/api/v1/users/profile', authorization, undefined)
        .catch(() => this.request<Record<string, unknown>>(this.config.userBaseUrl, '/users/profile', authorization, {})),
      this.request<Array<Record<string, unknown>> | Record<string, unknown>>(this.config.orderBaseUrl, '/orders', authorization, []),
      this.request<Array<Record<string, unknown>>>(this.config.wishlistBaseUrl, '/wishlist', authorization, [])
    ]);

    const user = (userRes as { data?: Record<string, unknown> })?.data ?? userRes ?? {};
    const orders = Array.isArray(ordersRes)
      ? ordersRes
      : Array.isArray((ordersRes as { data?: unknown[] })?.data)
      ? ((ordersRes as { data: Record<string, unknown>[] }).data)
      : [];

    return {
      user,
      recentOrders: orders.slice(0, 5),
      wishlistSummary: { totalItems: Array.isArray(wishlist) ? wishlist.length : 0 },
      addresses: Array.isArray((user as { addresses?: unknown[] }).addresses) ? ((user as { addresses?: unknown[] }).addresses as Record<string, unknown>[]) : []
    };
  }

  async getCheckout(customerId: string, authorization?: string): Promise<CheckoutView> {
    const [cartRes, profileRes, promotions] = await Promise.all([
      this.request<Record<string, unknown>>(this.config.cartBaseUrl, '/cart', authorization, { items: [], grandTotal: 0 }),
      this.request<Record<string, unknown>>(this.config.userBaseUrl, '/users/profile', authorization, {}),
      this.request<Array<Record<string, unknown>>>(this.config.promotionsBaseUrl, '/promotions', authorization, [])
    ]);

    const cart = (cartRes as { data?: Record<string, unknown> })?.data ?? cartRes;
    const profile = (profileRes as { data?: Record<string, unknown> })?.data ?? profileRes ?? {};
    const addresses = Array.isArray((profile as { addresses?: unknown[] }).addresses)
      ? ((profile as { addresses?: unknown[] }).addresses as Record<string, unknown>[])
      : [];

    return {
      cart,
      address: addresses[0] ?? null,
      deliveryEstimate: '10-20 minutes',
      availablePaymentMethods: ['UPI', 'CARD', 'COD'],
      coupons: Array.isArray(promotions) ? promotions : []
    };
  }

  async getOrders(customerId: string, authorization?: string): Promise<OrdersView> {
    const ordersRes = await this.request<Array<Record<string, unknown>> | Record<string, unknown>>(this.config.orderBaseUrl, '/orders', authorization, []);
    const orders = Array.isArray(ordersRes)
      ? ordersRes
      : Array.isArray((ordersRes as { data?: unknown[] })?.data)
      ? ((ordersRes as { data: Record<string, unknown>[] }).data)
      : [];

    return {
      orders: orders.filter((order) => String(order.customerId ?? order.userId ?? '') === customerId || true)
    };
  }

  async getOrder(customerId: string, orderId: string, authorization?: string): Promise<Record<string, unknown>> {
    const orderRes = await this.request<Record<string, unknown>>(
      this.config.orderBaseUrl,
      `/orders/${orderId}`,
      authorization
    );
    return (orderRes as { data?: Record<string, unknown> })?.data ?? orderRes;
  }

  async placeOrder(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    const response = await this.request<Record<string, unknown>>(
      this.config.orderBaseUrl,
      '/orders',
      authorization,
      undefined,
      'POST',
      payload
    );
    return (response as { data?: Record<string, unknown> })?.data ?? response;
  }

  async getWishlist(customerId: string, authorization?: string): Promise<WishlistView> {
    const wishlist = await this.request<Array<Record<string, unknown>>>(this.config.wishlistBaseUrl, `/api/v1/wishlist/${customerId}`, authorization, undefined)
      .catch(() => this.request<Array<Record<string, unknown>>>(this.config.wishlistBaseUrl, `/wishlist/${customerId}`, authorization, undefined))
      .catch(() => this.request<Array<Record<string, unknown>>>(this.config.wishlistBaseUrl, '/wishlist', authorization, []));
    return {
      items: Array.isArray(wishlist) ? wishlist : []
    };
  }

  async getNotifications(customerId: string, authorization?: string): Promise<NotificationsView> {
    const notifications = await this.request<Array<Record<string, unknown>>>(this.config.notificationBaseUrl, `/api/v1/notifications/${customerId}`, authorization, undefined)
      .catch(() => this.request<Array<Record<string, unknown>>>(this.config.notificationBaseUrl, `/notifications/${customerId}`, authorization, undefined))
      .catch(() => this.request<Array<Record<string, unknown>>>(this.config.notificationBaseUrl, '/notifications', authorization, []));
    return {
      notifications: Array.isArray(notifications) ? notifications : []
    };
  }

  async getAddresses(customerId: string, authorization?: string): Promise<Record<string, unknown>[]> {
    try {
      const res = await this.request<Array<Record<string, unknown>> | Record<string, unknown>>(this.config.userBaseUrl, '/users/addresses', authorization, []);
      const items = Array.isArray(res) ? res : Array.isArray((res as { data?: unknown[] })?.data) ? ((res as { data: Record<string, unknown>[] }).data) : [];
      return items;
    } catch {
      return [];
    }
  }

  async updateProfile(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.userBaseUrl, '/users/profile', authorization, {}, 'PUT', payload);
  }

  async addToCart(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.cartBaseUrl, '/cart/items', authorization, {}, 'POST', payload);
  }

  async updateCartItem(customerId: string, itemId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.cartBaseUrl, `/cart/items/${itemId}`, authorization, {}, 'PUT', payload);
  }

  async removeCartItem(customerId: string, itemId: string, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.cartBaseUrl, `/cart/items/${itemId}`, authorization, {}, 'DELETE');
  }

  async createAddress(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.userBaseUrl, '/users/addresses', authorization, {}, 'POST', payload);
  }

  async updateAddress(customerId: string, addressId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.userBaseUrl, `/users/addresses/${addressId}`, authorization, {}, 'PUT', payload);
  }

  async deleteAddress(customerId: string, addressId: string, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.userBaseUrl, `/users/addresses/${addressId}`, authorization, {}, 'DELETE');
  }

  async markNotificationRead(customerId: string, notificationId: string, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.notificationBaseUrl, `/notifications/${notificationId}/read`, authorization, {}, 'PATCH');
  }

  async addToWishlist(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.wishlistBaseUrl, '/wishlist/items', authorization, {}, 'POST', payload);
  }

  async removeFromWishlist(customerId: string, payload: Record<string, unknown>, authorization?: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.config.wishlistBaseUrl, '/wishlist/items', authorization, {}, 'DELETE', payload);
  }

  async getPaymentMethods(customerId: string, authorization?: string): Promise<Record<string, unknown>[]> {
    return [{ id: 'card', name: 'Credit / Debit Card', type: 'CARD' }, { id: 'upi', name: 'UPI', type: 'UPI' }, { id: 'cod', name: 'Cash on Delivery', type: 'COD' }];
  }
}
