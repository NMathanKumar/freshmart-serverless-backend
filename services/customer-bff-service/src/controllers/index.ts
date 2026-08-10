import { jsonResponse } from '@freshmart/platform-core';
import type { CustomerBffService } from '../services/index.js';

export const createCustomerBffController = (service: CustomerBffService) => ({
  home: async (customerId: string, authorization?: string) => jsonResponse(200, await service.getHome(customerId, authorization)),
  categories: async (authorization?: string) => jsonResponse(200, await service.getCategories(authorization)),
  productDetails: async (customerId: string, productId: string, authorization?: string) =>
    jsonResponse(200, await service.getProductDetails(customerId, productId, authorization)),
  cart: async (customerId: string, authorization?: string) => jsonResponse(200, await service.getCart(customerId, authorization)),
  checkout: async (customerId: string, authorization?: string) => jsonResponse(200, await service.getCheckout(customerId, authorization)),
  getOrders: async (customerId: string, authorization?: string) => jsonResponse(200, await service.getOrders(customerId, authorization)),
  getOrder: async (customerId: string, orderId: string, authorization?: string) =>
    jsonResponse(200, await service.getOrder(customerId, orderId, authorization)),
  placeOrder: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(201, await service.placeOrder(customerId, payload, authorization)),
  profile: async (customerId: string, authorization?: string) => jsonResponse(200, await service.getProfile(customerId, authorization)),
  updateProfile: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(200, await service.updateProfile(customerId, payload, authorization)),
  avatarUploadUrl: async (customerId: string, body: Record<string, unknown>) => {
    const fileName = (body?.fileName as string) || 'avatar.jpg';
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const bucket = process.env.AWS_S3_BUCKET || 'freshmart-dev-assets-769044546162';
    const region = process.env.AWS_REGION || 'ap-southeast-1';
    const key = `avatars/${customerId}_${Date.now()}_${cleanName}`;
    const avatarUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return jsonResponse(200, {
      uploadUrl: '#',
      avatarUrl
    });
  },
  wishlist: async (customerId: string, authorization?: string) => jsonResponse(200, await service.getWishlist(customerId, authorization)),
  addToWishlist: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(201, await service.addToWishlist(customerId, payload, authorization)),
  removeFromWishlist: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(204, await service.removeFromWishlist(customerId, payload, authorization)),
  notifications: async (customerId: string, authorization?: string) =>
    jsonResponse(200, await service.getNotifications(customerId, authorization)),
  markNotificationRead: async (customerId: string, notificationId: string, authorization?: string) =>
    jsonResponse(200, await service.markNotificationRead(customerId, notificationId, authorization)),
  addresses: async (customerId: string, authorization?: string) =>
    jsonResponse(200, await service.getAddresses(customerId, authorization)),
  createAddress: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(201, await service.createAddress(customerId, payload, authorization)),
  updateAddress: async (customerId: string, addressId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(200, await service.updateAddress(customerId, addressId, payload, authorization)),
  deleteAddress: async (customerId: string, addressId: string, authorization?: string) =>
    jsonResponse(204, await service.deleteAddress(customerId, addressId, authorization)),
  paymentMethods: async (customerId: string, authorization?: string) =>
    jsonResponse(200, await service.getPaymentMethods(customerId, authorization)),
  addToCart: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(201, await service.addToCart(customerId, payload, authorization)),
  updateCartItem: async (customerId: string, itemId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(200, await service.updateCartItem(customerId, itemId, payload, authorization)),
  removeCartItem: async (customerId: string, itemId: string, authorization?: string) =>
    jsonResponse(204, await service.removeCartItem(customerId, itemId, authorization)),

  // --- Missing endpoints added for SDK parity ---
  markAllNotificationsRead: async (customerId: string, authorization?: string) =>
    jsonResponse(200, await service.markAllNotificationsRead(customerId, authorization)),
  deleteNotification: async (customerId: string, notificationId: string, authorization?: string) =>
    jsonResponse(204, await service.deleteNotification(customerId, notificationId, authorization)),
  setDefaultAddress: async (customerId: string, addressId: string, authorization?: string) =>
    jsonResponse(200, await service.setDefaultAddress(customerId, addressId, authorization)),
  processPayment: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(200, await service.processPayment(customerId, payload, authorization)),
  getSecurity: async (customerId: string, authorization?: string) =>
    jsonResponse(200, await service.getSecurity(customerId, authorization)),
  getSessions: async (customerId: string, authorization?: string) =>
    jsonResponse(200, await service.getSessions(customerId, authorization)),
  logoutSession: async (customerId: string, sessionId: string, authorization?: string) =>
    jsonResponse(204, await service.logoutSession(customerId, sessionId, authorization)),
  logoutAllSessions: async (customerId: string, authorization?: string) =>
    jsonResponse(204, await service.logoutAllSessions(customerId, authorization)),
  deleteAccount: async (customerId: string, authorization?: string) =>
    jsonResponse(204, await service.deleteAccount(customerId, authorization)),
  getFaqs: async (_customerId: string, authorization?: string) =>
    jsonResponse(200, await service.getFaqs(authorization)),
  getSupportTickets: async (customerId: string, authorization?: string) =>
    jsonResponse(200, await service.getSupportTickets(customerId, authorization)),
  createSupportTicket: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(201, await service.createSupportTicket(customerId, payload, authorization)),
  getContactInformation: async () =>
    jsonResponse(200, await service.getContactInformation()),
  getSettings: async (customerId: string, authorization?: string) =>
    jsonResponse(200, await service.getSettings(customerId, authorization)),
  updateSettings: async (customerId: string, payload: Record<string, unknown>, authorization?: string) =>
    jsonResponse(200, await service.updateSettings(customerId, payload, authorization))
});
