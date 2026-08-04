import type {
  CustomerCheckoutResponse,
  CustomerHomeResponse,
  CustomerProfileResponse,
  NotificationsResponse,
  WishlistResponse
} from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';

export class CustomerBffClient {
  constructor(private readonly client: ApiClient) {}

  getHome() {
    return this.client.request<CustomerHomeResponse>({ method: 'GET', url: '/api/v1/customer/home' });
  }

  getCategories() {
    return this.client.request<Record<string, unknown>>({ method: 'GET', url: '/api/v1/customer/categories' });
  }

  getProductDetails(productId: string) {
    return this.client.request<Record<string, unknown>>({
      method: 'GET',
      url: `/api/v1/customer/products/${productId}`
    });
  }

  getCart() {
    return this.client.request<Record<string, unknown>>({ method: 'GET', url: '/api/v1/customer/cart' });
  }

  addToCart(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'POST', url: '/api/v1/customer/cart/items', data: payload });
  }

  updateCartItem(itemId: string, payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'PUT', url: `/api/v1/customer/cart/items/${itemId}`, data: payload });
  }

  removeCartItem(itemId: string) {
    return this.client.request<void>({ method: 'DELETE', url: `/api/v1/customer/cart/items/${itemId}` });
  }

  getCheckout() {
    return this.client.request<CustomerCheckoutResponse>({ method: 'GET', url: '/api/v1/customer/checkout' });
  }

  getOrders() {
    return this.client.request<Record<string, unknown>>({ method: 'GET', url: '/api/v1/customer/orders' });
  }

  getProfile() {
    return this.client.request<CustomerProfileResponse>({ method: 'GET', url: '/api/v1/customer/profile' });
  }

  getWishlist() {
    return this.client.request<WishlistResponse>({ method: 'GET', url: '/api/v1/customer/wishlist' });
  }

  addToWishlist(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'POST', url: '/api/v1/customer/wishlist/items', data: payload });
  }

  removeFromWishlist(payload: Record<string, unknown>) {
    return this.client.request<void>({ method: 'DELETE', url: '/api/v1/customer/wishlist/items', data: payload });
  }

  getNotifications() {
    return this.client.request<NotificationsResponse>({ method: 'GET', url: '/api/v1/customer/notifications' });
  }

  markNotificationRead(notificationId: string) {
    return this.client.request<Record<string, unknown>>({ method: 'PATCH', url: `/api/v1/customer/notifications/${notificationId}/read` });
  }

  markAllNotificationsRead() {
    return this.client.request<Record<string, unknown>>({ method: 'POST', url: '/api/v1/customer/notifications/read-all' });
  }

  deleteNotification(notificationId: string) {
    return this.client.request<void>({ method: 'DELETE', url: `/api/v1/customer/notifications/${notificationId}` });
  }

  getAddresses() {
    return this.client.request<Record<string, unknown>[]>({ method: 'GET', url: '/api/v1/customer/addresses' });
  }

  createAddress(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'POST', url: '/api/v1/customer/addresses', data: payload });
  }

  updateAddress(addressId: string, payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'PUT', url: `/api/v1/customer/addresses/${addressId}`, data: payload });
  }

  deleteAddress(addressId: string) {
    return this.client.request<void>({ method: 'DELETE', url: `/api/v1/customer/addresses/${addressId}` });
  }

  setDefaultAddress(addressId: string) {
    return this.client.request<Record<string, unknown>>({ method: 'POST', url: `/api/v1/customer/addresses/${addressId}/default` });
  }

  placeOrder(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'POST', url: '/api/v1/customer/orders', data: payload });
  }

  getPaymentMethods() {
    return this.client.request<Record<string, unknown>[]>({ method: 'GET', url: '/api/v1/customer/payment-methods' });
  }

  processPayment(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'POST', url: '/api/v1/customer/payments', data: payload });
  }

  getOrder(orderId: string) {
    return this.client.request<Record<string, unknown>>({ method: 'GET', url: `/api/v1/customer/orders/${orderId}` });
  }

  updateProfile(payload: Record<string, unknown>) {
    return this.client.request<CustomerProfileResponse>({ method: 'PUT', url: '/api/v1/customer/profile', data: payload });
  }

  getSecurity() {
    return this.client.request<Record<string, unknown>>({ method: 'GET', url: '/api/v1/customer/security' });
  }

  getSessions() {
    return this.client.request<Record<string, unknown>[]>({ method: 'GET', url: '/api/v1/customer/sessions' });
  }

  logoutSession(sessionId: string) {
    return this.client.request<void>({ method: 'DELETE', url: `/api/v1/customer/sessions/${sessionId}` });
  }

  logoutAllSessions() {
    return this.client.request<void>({ method: 'POST', url: '/api/v1/customer/sessions/logout-all' });
  }

  deleteAccount(payload?: Record<string, unknown>) {
    return this.client.request<void>({ method: 'DELETE', url: '/api/v1/customer/account', data: payload });
  }

  getFaqs() {
    return this.client.request<Record<string, unknown>[]>({ method: 'GET', url: '/api/v1/customer/help/faqs' });
  }

  getSupportTickets() {
    return this.client.request<Record<string, unknown>[]>({ method: 'GET', url: '/api/v1/customer/support/tickets' });
  }

  createSupportTicket(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'POST', url: '/api/v1/customer/support/tickets', data: payload });
  }

  getContactInformation() {
    return this.client.request<Record<string, unknown>>({ method: 'GET', url: '/api/v1/customer/help/contact' });
  }

  getSettings() {
    return this.client.request<Record<string, unknown>>({ method: 'GET', url: '/api/v1/customer/settings' });
  }

  updateSettings(payload: Record<string, unknown>) {
    return this.client.request<Record<string, unknown>>({ method: 'PUT', url: '/api/v1/customer/settings', data: payload });
  }
}
