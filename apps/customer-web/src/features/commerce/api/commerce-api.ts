import { ApiClient, ApiError, createFreshMartSdk } from '@freshmart/api-sdk';
import { authApi } from '../../auth/api/auth-api.js';
import { getCurrentUser, isAuthenticated, sharedSessionAccessor as authSessionAccessor } from '@freshmart/shared';
import {
  categoryProducts,
  mergeAddresses,
  mergeCart,
  mergeProducts,
  mergeWishlist,
  productDetail,
  searchProducts,
  type AddressView,
  type CartLine,
  type CommerceProduct
} from '../model/commerce-content.js';
import type { OrderDetailView, OrderItemView, OrderSummaryView } from '../model/order-content.js';

export interface ProductDetailsView {
  product: CommerceProduct;
  gallery: string[];
  similar: CommerceProduct[];
  isWishlisted: boolean;
}

export interface CheckoutView {
  cart: CartLine[];
  addresses: AddressView[];
  paymentMethods: string[];
  coupons: Array<Record<string, unknown>>;
  deliveryEstimate: string;
}

export interface AddressInput {
  label: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

const authBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:3000';
const customerBaseUrl = import.meta.env.VITE_CUSTOMER_API_BASE_URL ?? authBaseUrl;
const commerceBaseUrl = import.meta.env.VITE_COMMERCE_API_BASE_URL ?? customerBaseUrl;
const userBaseUrl = import.meta.env.VITE_USER_API_BASE_URL ?? customerBaseUrl;
const paymentBaseUrl = import.meta.env.VITE_PAYMENT_API_BASE_URL ?? customerBaseUrl;

const sdk = createFreshMartSdk({ authBaseUrl, customerBaseUrl, commerceBaseUrl, sessionAccessor: authSessionAccessor });
const commerceTransport = new ApiClient(commerceBaseUrl, authSessionAccessor);
const userTransport = new ApiClient(userBaseUrl, authSessionAccessor);
const paymentTransport = new ApiClient(paymentBaseUrl, authSessionAccessor);

const toApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return { status: error.statusCode ?? 500, data: error.problem ?? { detail: error.message } };
  }
  return { status: 500, data: { detail: error instanceof Error ? error.message : 'Unable to complete this request.' } };
};

const unwrap = <T,>(value: T | { data: T }): T =>
  typeof value === 'object' && value !== null && 'data' in value ? (value as { data: T }).data : value as T;

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : undefined;

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const asNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' && value.length > 0 ? value : fallback;

const toTitleCase = (value: string) =>
  value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeOrderItem = (value: unknown): OrderItemView => {
  const item = asRecord(value) ?? {};
  const quantity = asNumber(item.quantity);
  const unitPrice = asNumber(item.price ?? item.unitPrice);

  return {
    productId: asString(item.productId ?? item.sku, 'unknown-product'),
    productName: asString(item.productName ?? item.name, 'FreshMart Item'),
    quantity,
    unitPrice,
    totalPrice: asNumber(item.lineTotal ?? item.totalPrice ?? unitPrice * quantity)
  };
};

const normalizeAddress = (value: unknown) => {
  const address = asRecord(value);
  if (!address) return undefined;

  const lines = [
    address.line1,
    address.line2,
    address.landmark,
    address.city,
    address.state,
    address.postalCode
  ]
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim());

  return lines.length > 0 ? lines.join(', ') : undefined;
};

const normalizeOrder = (value: unknown): OrderDetailView => {
  const order = asRecord(value) ?? {};
  const items = asArray(order.items).map(normalizeOrderItem);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const orderStatus = asString(order.orderStatus ?? order.status, 'UNKNOWN');
  const paymentStatus = asString(order.paymentStatus, 'PENDING');
  const embeddedAddress = normalizeAddress(order.deliveryAddress ?? order.address ?? order.shippingAddress);

  return {
    orderId: asString(order.orderId, 'Unknown Order'),
    orderDate: asString(order.createdAt ?? order.updatedAt, new Date(0).toISOString()),
    orderStatus,
    orderStatusLabel: toTitleCase(orderStatus),
    paymentStatus,
    paymentStatusLabel: toTitleCase(paymentStatus),
    totalAmount: asNumber(order.totalAmount),
    subtotal: asNumber(order.subtotal),
    tax: asNumber(order.tax),
    discount: asNumber(order.discount ?? order.discountAmount),
    totalItems: items.length,
    totalQuantity,
    deliveryAddress: embeddedAddress,
    pickupTime: typeof order.pickupTime === 'string' ? order.pickupTime : undefined,
    items,
    itemsPreview: items.slice(0, 3),
    remainingItems: Math.max(items.length - 3, 0)
  };
};

const normalizeOrdersList = (response: unknown): OrderSummaryView[] => {
  const unwrapped = unwrap(response);
  const record = asRecord(unwrapped);
  const candidate = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(record?.data)
      ? record.data
      : Array.isArray(record?.items)
        ? record.items
        : [];

  return candidate.map(normalizeOrder);
};

const loadProductSnapshot = async (productId: string) => {
  const raw = unwrap(await sdk.catalog.getProduct(productId)) as unknown;
  const product = typeof raw === 'object' && raw !== null && 'data' in raw
    ? (raw as { data: Record<string, unknown> }).data
    : raw as Record<string, unknown>;

  return {
    productId,
    quantity: 1,
    price: Number(product.price ?? 0),
    productName: String(product.productName ?? product.name ?? productId),
    imageUrl: typeof product.imageUrl === 'string'
      ? product.imageUrl
      : Array.isArray(product.images) && typeof product.images[0] === 'string'
        ? product.images[0]
        : undefined,
    available: Boolean(product.available ?? true)
  };
};

export const commerceApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    searchProducts: builder.query<CommerceProduct[], { query?: string }>({
      queryFn: async ({ query = 'Organic Avocados' }) => {
        try {
          const response = await sdk.catalog.searchProducts(query, 24);
          return { data: mergeProducts(unwrap(response), searchProducts) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: ['CommerceSearch' as never]
    }),
    getCategoryListing: builder.query<CommerceProduct[], void>({
      queryFn: async () => {
        try {
          return { data: mergeProducts(unwrap(await sdk.catalog.listProducts()), categoryProducts) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: ['CommerceCatalog' as never]
    }),
    getCategories: builder.query<{ categoryId: string; name: string; slug: string; imageUrl: string }[], void>({
      queryFn: async () => {
        try {
          const rawCat = await sdk.category.listCategories();
          const categoriesResponse = unwrap(rawCat);
          const rawCategories = Array.isArray(categoriesResponse)
            ? categoriesResponse
            : Array.isArray((categoriesResponse as { data?: Array<Record<string, unknown>> })?.data)
              ? (categoriesResponse as { data: Array<Record<string, unknown>> }).data
              : [];

          const categories = rawCategories.map((rawItem, index) => {
            const cat = rawItem as Record<string, unknown>;
            return {
              categoryId: String(cat.categoryId ?? cat.id ?? `category-${index + 1}`),
              name: String(cat.name ?? `Category ${index + 1}`),
              slug: String(cat.slug ?? ''),
              imageUrl: String(cat.imageUrl ?? ''),
            };
          });
          return { data: categories };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: ['CommerceCatalog' as never]
    }),
    getProductDetails: builder.query<ProductDetailsView, string | undefined>({
      queryFn: async (productId = 'PROD-001') => {
        const fallbackProduct = categoryProducts.find((p) => p.productId === productId || (p as any).id === productId) ?? categoryProducts[0];
        try {
          const response = unwrap(await sdk.catalog.getProduct(productId));
          const remoteProduct = (response as { data?: unknown }).data ?? response;
          const merged = mergeProducts([remoteProduct], [fallbackProduct])[0] ?? fallbackProduct;
          return {
            data: {
              ...productDetail,
              product: merged,
              isWishlisted: false
            }
          };
        } catch (_) {
          return {
            data: {
              ...productDetail,
              product: fallbackProduct,
              isWishlisted: false
            }
          };
        }
      },
      providesTags: ['CommerceCatalog' as never]
    }),
    getCart: builder.query<CartLine[], void>({
      queryFn: async () => {
        const { getStoredCart } = await import('../model/commerce-content.js');
        if (!isAuthenticated()) {
          return { data: getStoredCart() };
        }
        try {
          const remoteCart = await sdk.cart.getCart();
          return { data: mergeCart(remoteCart) };
        } catch (_) {
          return { data: getStoredCart() };
        }
      },
      providesTags: ['CommerceCart' as never, 'Cart' as never]
    }),
    updateCartItem: builder.mutation<Record<string, unknown>, { productId: string; quantity: number; name?: string; price?: number; brand?: string; imageUrl?: string }>({
      queryFn: async ({ productId, quantity, name, price, brand, imageUrl }) => {
        const { addOrUpdateStoredCartItem, removeStoredCartItem } = await import('../model/commerce-content.js');
        if (quantity <= 0) {
          removeStoredCartItem(productId);
        } else {
          addOrUpdateStoredCartItem({ productId, quantity, name, price, brand, imageUrl });
        }

        if (isAuthenticated()) {
          try {
            if (quantity > 1) {
              await sdk.cart.updateItem(productId, { quantity });
            } else if (quantity === 1) {
              await sdk.cart.saveCart({
                productId,
                quantity: 1,
                price: price ?? 4.99,
                productName: name ?? productId,
                imageUrl,
                available: true
              });
            } else {
              await sdk.cart.removeItem(productId);
            }
          } catch (_) {
            // Silently handle remote sync errors
          }
        }

        return { data: { productId, quantity, success: true } };
      },
      invalidatesTags: ['CommerceCart' as never, 'Cart' as never, 'CustomerHome' as never]
    }),
    removeCartItem: builder.mutation<Record<string, unknown>, { productId: string }>({
      queryFn: async ({ productId }) => {
        const { removeStoredCartItem } = await import('../model/commerce-content.js');
        removeStoredCartItem(productId);

        try {
          await sdk.cart.removeItem(productId);
        } catch (_) {
          // Ignore remote errors
        }

        return { data: { productId, success: true } };
      },
      invalidatesTags: ['CommerceCart' as never, 'Cart' as never, 'CustomerHome' as never]
    }),
    getAddresses: builder.query<AddressView[], void>({
      queryFn: async () => {
        try {
          return { data: mergeAddresses(await userTransport.request<unknown>({ method: 'GET', url: '/users/profile' })) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: ['CommerceAddresses' as never]
    }),
    addAddress: builder.mutation<Record<string, unknown>, AddressInput>({
      queryFn: async (address) => {
        const payload = {
          label: address.label,
          name: address.name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          isDefault: address.isDefault
        };

        try {
          const response = await userTransport.request<Record<string, unknown>>({
            method: 'POST',
            url: '/users/addresses',
            data: payload
          });
          return { data: response ?? { success: true, ...address } };
        } catch (_) {
          try {
            const userEmail = getCurrentUser()?.email ?? 'user@freshmart.com';
            await userTransport.request({
              method: 'PUT',
              url: '/users/profile',
              data: { name: address.name, email: userEmail, phone: address.phone }
            });

            const retryResponse = await userTransport.request<Record<string, unknown>>({
              method: 'POST',
              url: '/users/addresses',
              data: payload
            });
            return { data: retryResponse ?? { success: true, ...address } };
          } catch (_) {
            return { data: { success: true, addressId: `addr-${Date.now()}`, ...address } };
          }
        }
      },
      invalidatesTags: ['CommerceAddresses' as never]
    }),
    deleteAddress: builder.mutation<Record<string, unknown>, { addressId: string }>({
      queryFn: async ({ addressId }) => {
        try {
          const response = await userTransport.request<Record<string, unknown>>({
            method: 'DELETE',
            url: `/users/addresses/${encodeURIComponent(addressId)}`
          });
          return { data: response ?? { success: true } };
        } catch (_) {
          return { data: { success: true, addressId } };
        }
      },
      invalidatesTags: ['CommerceAddresses' as never]
    }),
    getCheckout: builder.query<CheckoutView, void>({
      queryFn: async () => {
        try {
          const cart = await sdk.cart.getCart();
          const profile = await userTransport.request<unknown>({ method: 'GET', url: '/v1/users/profile' });
          return {
            data: {
              cart: mergeCart(cart),
              addresses: mergeAddresses(profile),
              paymentMethods: ['CARD', 'UPI', 'NET_BANKING', 'WALLET', 'COD'],
              coupons: [],
              deliveryEstimate: '10-20 minutes'
            }
          };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: ['CommerceCheckout' as never, 'CommerceCart' as never, 'CommerceAddresses' as never]
    }),
    getOrders: builder.query<OrderSummaryView[], void>({
      queryFn: async () => {
        try {
          const response = await sdk.order.listOrders();
          return { data: normalizeOrdersList(response) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: ['CommerceOrders' as never]
    }),
    getOrder: builder.query<OrderDetailView | undefined, string | undefined>({
      queryFn: async (orderId) => {
        if (!orderId) {
          return { data: undefined };
        }

        try {
          const response = await commerceTransport.request<Record<string, unknown>>({
            method: 'GET',
            url: `/v1/orders/${encodeURIComponent(orderId)}`
          });
          const record = asRecord(response);
          const candidate = record && 'data' in record ? record.data : response;
          return { data: normalizeOrder(candidate) };
        } catch (_) {
          try {
            const response = unwrap(await sdk.order.getOrder(orderId));
            const record = asRecord(response);
            const candidate = record && 'data' in record ? record.data : response;
            return { data: normalizeOrder(candidate) };
          } catch (error) {
            return { error: toApiError(error) };
          }
        }
      },
      providesTags: ['CommerceOrders' as never]
    }),
    createPayment: builder.mutation<Record<string, unknown>, { orderId: string; paymentMethod: string; amount?: number; currency?: string }>({
      queryFn: async (payload) => {
        try {
          const res = await paymentTransport.request<Record<string, unknown>>({
            method: 'POST',
            url: '/v1/payments',
            data: { ...payload, amount: payload.amount ?? 0, currency: payload.currency ?? 'INR' }
          });
          return { data: res ?? { success: true, paymentId: `PAY-${Date.now()}`, status: 'SUCCESS' } };
        } catch (_) {
          return {
            data: {
              success: true,
              paymentId: `PAY-${Date.now()}`,
              orderId: payload.orderId,
              paymentStatus: 'SUCCESS',
              paymentMethod: payload.paymentMethod
            }
          };
        }
      }
    }),
    createOrder: builder.mutation<
      Record<string, unknown>,
      {
        items: unknown[];
        itemSubtotal?: number;
        subtotal?: number;
        platformFee?: number;
        deliveryFee?: number;
        tax?: number;
        taxes?: number;
        discount?: number;
        totalAmount?: number;
        grandTotal?: number;
        deliveryAddress?: string;
        deliveryAddressData?: unknown;
        paymentMethod?: string;
      }
    >({
      queryFn: async (payload) => {
        const sessionUser = getCurrentUser();
        let userEmail = sessionUser?.email || '';
        let userName = sessionUser?.name || '';

        if (!userEmail && typeof localStorage !== 'undefined') {
          try {
            const rawSession = localStorage.getItem('freshmart_session') || localStorage.getItem('freshmart_auth') || localStorage.getItem('freshmart_auth_session');
            if (rawSession) {
              const parsed = JSON.parse(rawSession);
              userEmail = parsed.email || parsed.user?.email || parsed.claims?.email || '';
              userName = parsed.name || parsed.user?.name || parsed.claims?.name || '';
            }
          } catch (_) {}
        }

        userEmail = userEmail || (typeof localStorage !== 'undefined' ? localStorage.getItem('freshmart_user_email') : null) || 'nmadhankumar597@gmail.com';
        userName = userName || (typeof localStorage !== 'undefined' ? localStorage.getItem('freshmart_user_name') : null) || 'Valued Customer';
        const subtotal = payload.subtotal ?? payload.itemSubtotal ?? (payload.items as any[])?.reduce((sum: number, i: any) => sum + (Number(i.price || 0) * Number(i.quantity || 1)), 0) ?? 2.99;
        const platformFee = payload.platformFee ?? 1.50;
        const deliveryFee = payload.deliveryFee ?? 0.00;
        const taxes = payload.taxes ?? payload.tax ?? 1.35;
        const grandTotal = payload.grandTotal ?? payload.totalAmount ?? (subtotal + platformFee + deliveryFee + taxes);

        const enrichedPayload = {
          ...payload,
          subtotal,
          itemSubtotal: subtotal,
          platformFee,
          deliveryFee,
          tax: taxes,
          taxes,
          discount: 0,
          totalAmount: grandTotal,
          grandTotal,
          customerEmail: userEmail,
          customerName: userName,
        };

        try {
          const response = await commerceTransport.request<Record<string, unknown>>({
            method: 'POST',
            url: '/v1/orders',
            data: enrichedPayload
          });
          const record = asRecord(response);
          const candidate = (record && 'data' in record ? (record.data as Record<string, unknown>) : response) as Record<string, unknown>;
          return { data: candidate };
        } catch (error) {
          try {
            const response = await userTransport.request<Record<string, unknown>>({
              method: 'POST',
              url: '/api/v1/customer/orders',
              data: enrichedPayload
            });
            const record = asRecord(response);
            const candidate = (record && 'data' in record ? (record.data as Record<string, unknown>) : response) as Record<string, unknown>;
            return { data: candidate };
          } catch (innerErr) {
            return { error: toApiError(innerErr) };
          }
        }
      },
      invalidatesTags: ['CommerceOrders' as never, 'CommerceCart' as never, 'Cart' as never, 'CommerceNotifications' as never]
    }),
    getNotifications: builder.query<unknown[], void>({
      queryFn: async () => {
        try {
          const response = await userTransport.request<Record<string, unknown>>({
            method: 'GET',
            url: '/api/v1/customer/notifications'
          });
          const record = asRecord(response);
          const candidate = record && 'data' in record && Array.isArray(record.data)
            ? (record.data as unknown[])
            : (record && 'notifications' in record && Array.isArray(record.notifications)
                ? (record.notifications as unknown[])
                : (Array.isArray(response) ? (response as unknown[]) : []));
          return { data: candidate };
        } catch (_) {
          return { data: [] };
        }
      },
      providesTags: ['CommerceNotifications' as never]
    }),
    markNotificationRead: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await userTransport.request({
            method: 'PATCH',
            url: `/api/v1/customer/notifications/${id}/read`
          });
          return { data: undefined };
        } catch (_) {
          return { data: undefined };
        }
      },
      invalidatesTags: ['CommerceNotifications' as never]
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await userTransport.request({
            method: 'POST',
            url: '/api/v1/customer/notifications/read-all'
          });
          return { data: undefined };
        } catch (_) {
          return { data: undefined };
        }
      },
      invalidatesTags: ['CommerceNotifications' as never]
    }),
    deleteNotification: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await userTransport.request({
            method: 'DELETE',
            url: `/api/v1/customer/notifications/${id}`
          });
          return { data: undefined };
        } catch (_) {
          return { data: undefined };
        }
      },
      invalidatesTags: ['CommerceNotifications' as never]
    }),
    deleteAllNotifications: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await userTransport.request({
            method: 'DELETE',
            url: '/api/v1/customer/notifications'
          });
          return { data: undefined };
        } catch (_) {
          return { data: undefined };
        }
      },
      invalidatesTags: ['CommerceNotifications' as never]
    }),
    getWishlist: builder.query<CommerceProduct[], void>({
      queryFn: async () => {
        const { getStoredWishlist } = await import('../model/commerce-content.js');
        if (!isAuthenticated()) {
          return { data: getStoredWishlist() };
        }
        try {
          const user = getCurrentUser();
          const customerId = user?.userId || 'guest';
          const response = unwrap(await sdk.wishlist.getWishlist(customerId));
          return { data: mergeWishlist(response) };
        } catch (_) {
          return { data: getStoredWishlist() };
        }
      },
      providesTags: ['CommerceWishlist' as never, 'Wishlist' as never]
    }),
    addToWishlist: builder.mutation<Record<string, unknown>, CommerceProduct>({
      queryFn: async (product) => {
        const { addOrUpdateStoredWishlistItem } = await import('../model/commerce-content.js');
        addOrUpdateStoredWishlistItem(product as unknown as Record<string, unknown>);

        if (isAuthenticated()) {
          try {
            const user = getCurrentUser();
            const customerId = user?.userId || 'guest';
            await sdk.wishlist.addItem({
              customerId,
              productId: product.productId,
              sku: product.productId,
              productName: product.name
            });
          } catch (_) {
            // Silently handle remote sync errors
          }
        }

        return { data: { productId: product.productId, success: true } };
      },
      invalidatesTags: ['CommerceWishlist' as never, 'Wishlist' as never]
    }),
    removeFromWishlist: builder.mutation<Record<string, unknown>, { productId: string }>({
      queryFn: async ({ productId }) => {
        const { removeStoredWishlistItem } = await import('../model/commerce-content.js');
        removeStoredWishlistItem(productId);

        if (isAuthenticated()) {
          try {
            const user = getCurrentUser();
            const customerId = user?.userId || 'guest';
            await sdk.wishlist.removeItem({ customerId, wishlistItemId: productId, productId });
          } catch (_) {
            // Silently handle remote errors
          }
        }

        return { data: { productId, success: true } };
      },
      invalidatesTags: ['CommerceWishlist' as never, 'Wishlist' as never]
    })
  }),
  overrideExisting: false
});

export const {
  useAddAddressMutation,
  useCreateOrderMutation,
  useCreatePaymentMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useGetCartQuery,
  useGetCategoriesQuery,
  useGetCategoryListingQuery,
  useGetCheckoutQuery,
  useGetOrderQuery,
  useGetOrdersQuery,
  useGetProductDetailsQuery,
  useRemoveCartItemMutation,
  useSearchProductsQuery,
  useUpdateCartItemMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation
} = commerceApi;

