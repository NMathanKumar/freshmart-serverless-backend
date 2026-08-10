import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createCustomerBffController } from '../controllers/index.js';
import { InMemoryAggregationCacheRepository } from '../repositories/index.js';
import { CustomerBffService, HttpCustomerGateway } from '../services/index.js';

const config = loadConfig('customer-bff-service', {
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1),
  CUSTOMER_CATALOG_API_URL: z.string().url(),
  CUSTOMER_CATEGORY_API_URL: z.string().url(),
  CUSTOMER_CART_API_URL: z.string().url(),
  CUSTOMER_ORDER_API_URL: z.string().url(),
  CUSTOMER_USER_API_URL: z.string().url(),
  CUSTOMER_WISHLIST_API_URL: z.string().url(),
  CUSTOMER_NOTIFICATION_API_URL: z.string().url(),
  CUSTOMER_PROMOTIONS_API_URL: z.string().url(),
  CUSTOMER_COUPON_API_URL: z.string().url()
});

const controller = createCustomerBffController(
  new CustomerBffService(
    new HttpCustomerGateway({
      catalogBaseUrl: config.CUSTOMER_CATALOG_API_URL,
      categoryBaseUrl: config.CUSTOMER_CATEGORY_API_URL,
      cartBaseUrl: config.CUSTOMER_CART_API_URL,
      orderBaseUrl: config.CUSTOMER_ORDER_API_URL,
      userBaseUrl: config.CUSTOMER_USER_API_URL,
      wishlistBaseUrl: config.CUSTOMER_WISHLIST_API_URL,
      notificationBaseUrl: config.CUSTOMER_NOTIFICATION_API_URL,
      promotionsBaseUrl: config.CUSTOMER_PROMOTIONS_API_URL
    }),
    new InMemoryAggregationCacheRepository()
  )
);

const getAuth = (event: any) => event.headers?.authorization || event.headers?.Authorization || undefined;

export const routes: RouteDefinition[] = [
  // /customer/home (and legacy /api/v1/customer/home)
  {
    method: 'GET',
    path: '/customer/home',
    authorize: false,
    handler: ({ auth, event }) => controller.home(auth?.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/home',
    authorize: false,
    handler: ({ auth, event }) => controller.home(auth?.subject ?? 'guest', getAuth(event))
  },

  // /customer/categories (and legacy /api/v1/customer/categories)
  {
    method: 'GET',
    path: '/customer/categories',
    authorize: false,
    handler: ({ event }) => controller.categories(getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/categories',
    authorize: false,
    handler: ({ event }) => controller.categories(getAuth(event))
  },

  // /customer/products/:productId
  {
    method: 'GET',
    path: '/customer/products/:productId',
    authorize: false,
    handler: ({ auth, params, event }) => controller.productDetails(auth?.subject ?? 'guest', params.productId, getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/products/:productId',
    authorize: false,
    handler: ({ auth, params, event }) => controller.productDetails(auth?.subject ?? 'guest', params.productId, getAuth(event))
  },

  // Authenticated routes
  {
    method: 'GET',
    path: '/customer/cart',
    authorize: true,
    handler: ({ auth, event }) => controller.cart(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/cart',
    authorize: true,
    handler: ({ auth, event }) => controller.cart(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/customer/cart/items',
    authorize: true,
    handler: ({ auth, body, event }) => controller.addToCart(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'PUT',
    path: '/api/v1/customer/cart/items/:itemId',
    authorize: true,
    handler: ({ auth, params, body, event }) => controller.updateCartItem(auth.subject ?? 'guest', params.itemId, (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/api/v1/customer/cart/items/:itemId',
    authorize: true,
    handler: ({ auth, params, event }) => controller.removeCartItem(auth.subject ?? 'guest', params.itemId, getAuth(event))
  },

  {
    method: 'GET',
    path: '/customer/checkout',
    authorize: true,
    handler: ({ auth, event }) => controller.checkout(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/checkout',
    authorize: true,
    handler: ({ auth, event }) => controller.checkout(auth.subject ?? 'guest', getAuth(event))
  },

  {
    method: 'GET',
    path: '/customer/orders',
    authorize: true,
    handler: ({ auth, event }) => controller.getOrders(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/orders',
    authorize: true,
    handler: ({ auth, event }) => controller.getOrders(auth.subject ?? 'guest', getAuth(event))
  },

  {
    method: 'GET',
    path: '/customer/orders/:orderId',
    authorize: true,
    handler: ({ auth, params, event }) => controller.getOrder(auth.subject ?? 'guest', params.orderId, getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/orders/:orderId',
    authorize: true,
    handler: ({ auth, params, event }) => controller.getOrder(auth.subject ?? 'guest', params.orderId, getAuth(event))
  },

  {
    method: 'POST',
    path: '/customer/orders',
    authorize: true,
    handler: ({ auth, body, event }) => controller.placeOrder(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/customer/orders',
    authorize: true,
    handler: ({ auth, body, event }) => controller.placeOrder(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },

  {
    method: 'GET',
    path: '/customer/profile',
    authorize: true,
    handler: ({ auth, event }) => controller.profile(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/profile',
    authorize: true,
    handler: ({ auth, event }) => controller.profile(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'PUT',
    path: '/api/v1/customer/profile',
    authorize: true,
    handler: ({ auth, body, event }) => controller.updateProfile(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },

  {
    method: 'GET',
    path: '/customer/wishlist',
    authorize: true,
    handler: ({ auth, event }) => controller.wishlist(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/wishlist',
    authorize: true,
    handler: ({ auth, event }) => controller.wishlist(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/wishlist',
    authorize: true,
    handler: ({ auth, event }) => controller.wishlist(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/v1/wishlist',
    authorize: true,
    handler: ({ auth, event }) => controller.wishlist(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/wishlist',
    authorize: true,
    handler: ({ auth, event }) => controller.wishlist(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/wishlist/:customerId',
    authorize: false,
    handler: ({ auth, params, event }) => controller.wishlist(params?.customerId || auth.subject || 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/v1/wishlist/:customerId',
    authorize: false,
    handler: ({ auth, params, event }) => controller.wishlist(params?.customerId || auth.subject || 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/wishlist/:customerId',
    authorize: false,
    handler: ({ auth, params, event }) => controller.wishlist(params?.customerId || auth.subject || 'guest', getAuth(event))
  },
  {
    method: 'POST',
    path: '/wishlist/items',
    authorize: false,
    handler: ({ auth, body, event }) => controller.addToWishlist(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'POST',
    path: '/v1/wishlist/items',
    authorize: false,
    handler: ({ auth, body, event }) => controller.addToWishlist(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/wishlist/items',
    authorize: false,
    handler: ({ auth, body, event }) => controller.addToWishlist(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/customer/wishlist/items',
    authorize: true,
    handler: ({ auth, body, event }) => controller.addToWishlist(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/wishlist/items',
    authorize: false,
    handler: ({ auth, body, event }) => controller.removeFromWishlist(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/v1/wishlist/items',
    authorize: false,
    handler: ({ auth, body, event }) => controller.removeFromWishlist(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/api/v1/wishlist/items',
    authorize: false,
    handler: ({ auth, body, event }) => controller.removeFromWishlist(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/api/v1/customer/wishlist/items',
    authorize: true,
    handler: ({ auth, body, event }) => controller.removeFromWishlist(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },

  {
    method: 'GET',
    path: '/customer/notifications',
    authorize: true,
    handler: ({ auth, event }) => controller.notifications(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/notifications',
    authorize: true,
    handler: ({ auth, event }) => controller.notifications(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'PATCH',
    path: '/api/v1/customer/notifications/:notificationId/read',
    authorize: true,
    handler: ({ auth, params, event }) => controller.markNotificationRead(auth.subject ?? 'guest', params.notificationId, getAuth(event))
  },

  {
    method: 'GET',
    path: '/customer/addresses',
    authorize: true,
    handler: ({ auth, event }) => controller.addresses(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/addresses',
    authorize: true,
    handler: ({ auth, event }) => controller.addresses(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/v1/customer/addresses',
    authorize: true,
    handler: ({ auth, event }) => controller.addresses(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/customer/addresses',
    authorize: true,
    handler: ({ auth, body, event }) => controller.createAddress(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'PUT',
    path: '/api/v1/customer/addresses/:addressId',
    authorize: true,
    handler: ({ auth, params, body, event }) => controller.updateAddress(auth.subject ?? 'guest', params.addressId, (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/api/v1/customer/addresses/:addressId',
    authorize: true,
    handler: ({ auth, params, event }) => controller.deleteAddress(auth.subject ?? 'guest', params.addressId, getAuth(event))
  },

  {
    method: 'GET',
    path: '/customer/payment-methods',
    authorize: true,
    handler: ({ auth, event }) => controller.paymentMethods(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/payment-methods',
    authorize: true,
    handler: ({ auth, event }) => controller.paymentMethods(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/v1/customer/payment-methods',
    authorize: true,
    handler: ({ auth, event }) => controller.paymentMethods(auth.subject ?? 'guest', getAuth(event))
  },

  // --- Missing routes added for SDK parity ---
  {
    method: 'POST',
    path: '/api/v1/customer/notifications/read-all',
    authorize: true,
    handler: ({ auth, event }) => controller.markAllNotificationsRead(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/api/v1/customer/notifications/:notificationId',
    authorize: true,
    handler: ({ auth, params, event }) => controller.deleteNotification(auth.subject ?? 'guest', params.notificationId, getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/customer/addresses/:addressId/default',
    authorize: true,
    handler: ({ auth, params, event }) => controller.setDefaultAddress(auth.subject ?? 'guest', params.addressId, getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/customer/payments',
    authorize: true,
    handler: ({ auth, body, event }) => controller.processPayment(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/security',
    authorize: true,
    handler: ({ auth, event }) => controller.getSecurity(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/sessions',
    authorize: true,
    handler: ({ auth, event }) => controller.getSessions(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/api/v1/customer/sessions/:sessionId',
    authorize: true,
    handler: ({ auth, params, event }) => controller.logoutSession(auth.subject ?? 'guest', params.sessionId, getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/customer/sessions/logout-all',
    authorize: true,
    handler: ({ auth, event }) => controller.logoutAllSessions(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'DELETE',
    path: '/api/v1/customer/account',
    authorize: true,
    handler: ({ auth, event }) => controller.deleteAccount(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/help/faqs',
    authorize: false,
    handler: ({ auth, event }) => controller.getFaqs(auth?.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/support/tickets',
    authorize: true,
    handler: ({ auth, event }) => controller.getSupportTickets(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'POST',
    path: '/api/v1/customer/support/tickets',
    authorize: true,
    handler: ({ auth, body, event }) => controller.createSupportTicket(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  },
  {
    method: 'GET',
    path: '/api/v1/customer/help/contact',
    authorize: false,
    handler: () => controller.getContactInformation()
  },
  {
    method: 'GET',
    path: '/api/v1/customer/settings',
    authorize: true,
    handler: ({ auth, event }) => controller.getSettings(auth.subject ?? 'guest', getAuth(event))
  },
  {
    method: 'PUT',
    path: '/api/v1/customer/settings',
    authorize: true,
    handler: ({ auth, body, event }) => controller.updateSettings(auth.subject ?? 'guest', (body as Record<string, unknown>) ?? {}, getAuth(event))
  }
];

export const handler = createLambdaHandler({
  serviceName: 'customer-bff-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'id'
  }
});
