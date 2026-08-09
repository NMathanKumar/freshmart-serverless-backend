import { ApiError, createFreshMartSdk, type CustomerHomeResponse } from '@freshmart/api-sdk';
import { authApi } from '../../auth/api/auth-api.js';
import { getEnvironmentUrls, sharedSessionAccessor as authSessionAccessor } from '@freshmart/shared';

const envUrls = getEnvironmentUrls();
const authBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL || envUrls.authApiBaseUrl;
const customerBaseUrl = import.meta.env.VITE_CUSTOMER_API_BASE_URL || envUrls.commerceApiBaseUrl;
const sdk = createFreshMartSdk({ authBaseUrl, customerBaseUrl, commerceBaseUrl: customerBaseUrl, sessionAccessor: authSessionAccessor });

const unwrap = <T,>(value: T | { data: T }): T =>
  typeof value === 'object' && value !== null && 'data' in value ? (value as { data: T }).data : value as T;

const toApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return { status: error.statusCode ?? 500, data: error.problem ?? { detail: error.message } };
  }

  return { status: 500, data: { detail: error instanceof Error ? error.message : 'Unable to load FreshMart.' } };
};

const defaultCategories = [
  { categoryId: 'cat-1', name: 'Fresh Fruits' },
  { categoryId: 'cat-2', name: 'Dairy & Eggs' },
  { categoryId: 'cat-3', name: 'Beverages' },
  { categoryId: 'cat-4', name: 'Snacks & Bakery' },
  { categoryId: 'cat-5', name: 'Organic Staples' },
  { categoryId: 'cat-6', name: 'Personal Care' }
];

const defaultProducts = [
  {
    productId: 'PROD-001',
    name: 'Fresh Organic Fuji Apples',
    productName: 'Fresh Organic Fuji Apples',
    price: 4.99,
    category: 'Fresh Fruits',
    brand: 'FreshMart Organic',
    available: true,
    stock: 100,
    unit: '1 kg',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSHs0NoGGfIYxwIsyWj4vdh5kPA6QRji00Ii_lH3pVavw-d6dflAFH2xfLRc7nhy0VsPUgLJmXhz4hfJXWIpI_MrOcbL68xaRTzInZH56nC-pmYNylqYdiG9kooerikkbZQ5rbh_DOv-vJCnYk-9TR5MQQfqAkILwK0p-L7GVVLYSuCq6ijxgSQHWu63I14zGiQuXh-S5kHsDqini0IBQEDyW4mtGSN9jKU5d7tUrOiZHiOyIcmBW5bcB-FUo3Cl37zDruhJm2xR']
  },
  {
    productId: 'PROD-002',
    name: 'Farm Fresh Whole Milk',
    productName: 'Farm Fresh Whole Milk',
    price: 3.49,
    category: 'Dairy & Eggs',
    brand: 'FreshMart Dairy',
    available: true,
    stock: 150,
    unit: '1 Litre',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCSHaELNOhgX7mXWpkTZoBd8EkjiC2gtiPjn00f0mfjjc35_Do4_8Cy5vfaZ00jCjl_LWa_yqs1YWNNxfKG-47zOk6_uc4o68CzFG_6qcXMcdsDVDl_SyzMzXoPgwzJXcSlEVxzUTctK3lNfyPPIhPNxdF9p3-VLXrfZOpRAlbQ8V_eSjtPAmHqEI4QEygGblDnpdLD1BIr84P3DEYq4457nmGfVawMGFAmdA0Sx86DswR32pk7VCPiD5p8M9i4wnqts7_21AyM6I6S']
  },
  {
    productId: 'PROD-003',
    name: 'Artisanal Whole Wheat Bread',
    productName: 'Artisanal Whole Wheat Bread',
    price: 2.99,
    category: 'Snacks & Bakery',
    brand: 'FreshMart Bakery',
    available: true,
    stock: 80,
    unit: '400g',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAocIVc-EoYCbFmS10USZQHrW2cBY3jC44RL3aegAleg9zH39V0IHSWwM6MIKPQO6ifSz4gqZNGdwbezCWTwpjY26PgUPmNirsv572TsUAyQLu6A8XrYc_0UG8v0nwTw-VYaT0SMJPhU_zb_d9e0nSrxGxXQbl6Lx_YXZsdI0Y_-NYBK5I62D_ProCKkx-hG1xm3k6nMB89NGrtr-8Z1cQoVuXM7LxVdoQLwhsZlw2KSjnxaqws6Q_tmOCTfNEAnRlce3LxYTMFdXYO']
  },
  {
    productId: 'PROD-004',
    name: 'Raw Organic Wildflower Honey',
    productName: 'Raw Organic Wildflower Honey',
    price: 7.99,
    category: 'Organic Staples',
    brand: 'FreshMart Naturals',
    available: true,
    stock: 60,
    unit: '500g',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuA-8ZKxMuvb9QVdjRnKXyn-bmUF69PYQ5gWY2M8ofX8H15-hmkg8-Gy-qHR61k7JtnnVXh0JF7KRg0XbNdLeLtRYR0G-xZpY9RiUPqL8qFvdL9Sp-Axe1JpioUqZnCOyw_xkiBbtnq4PKTIO-9B6bZ_Muj4HirdjRXta4ycEsR1xOPMARFTJ4AC5WVY5yZbXglG-7V9upqCvyqtUT3kFfCrcwaLkmpmB1REpl05m6AtigOrnjL4cpAY8P4SDTpYFsOlnJyXkgQpo17u']
  }
];

export const homeApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerHome: builder.query<CustomerHomeResponse, void>({
      queryFn: async () => {
        try {
          let productsResponse: unknown = null;
          try {
            productsResponse = unwrap(await sdk.catalog.listProducts());
          } catch (_) {
            // Unhandled catalog error fallback
          }

          let cartResponse: unknown = null;
          try {
            cartResponse = await sdk.cart.getCart();
          } catch (_) {
            // Guest or unauthenticated user - cart remains empty
          }

          const rawProducts = Array.isArray(productsResponse)
            ? productsResponse
            : Array.isArray((productsResponse as { data?: Array<Record<string, unknown>> })?.data)
              ? (productsResponse as { data: Array<Record<string, unknown>> }).data
              : [];

          const featuredProducts = rawProducts.length > 0
            ? rawProducts.map((product, index) => {
                const productId = String(product.productId ?? `product-${index + 1}`);
                const productName = String(product.productName ?? product.name ?? `FreshMart Product ${index + 1}`);
                const price = Number(product.price ?? 0);
                const category = String(product.category ?? 'FreshMart');
                const images = Array.isArray(product.images) ? (product.images as unknown[]).filter((image: unknown): image is string => typeof image === 'string' && image.length > 0) : [];
                const primaryImage = typeof product.imageUrl === 'string' ? product.imageUrl : images[0] ?? '';

                return {
                  available: Boolean(product.available ?? true),
                  brand: String(product.brand ?? product.brandName ?? 'FreshMart'),
                  category,
                  createdAt: typeof product.createdAt === 'string' ? product.createdAt : undefined,
                  description: typeof product.description === 'string' ? product.description : undefined,
                  images: primaryImage ? [primaryImage, ...images.filter((image: string) => image !== primaryImage)] : images,
                  name: productName,
                  price,
                  productId,
                  productName,
                  stock: Number(product.stock ?? 0),
                  unit: typeof product.unit === 'string' ? product.unit : undefined,
                  updatedAt: typeof product.updatedAt === 'string' ? product.updatedAt : undefined,
                  weight: typeof product.weight === 'number' ? product.weight : undefined,
                  version: typeof product.version === 'number' ? product.version : undefined
                };
              })
            : defaultProducts;

          const categories = rawProducts.length > 0
            ? [...new Set(rawProducts.map((product) => String(product.category || '').trim()).filter(Boolean))]
                .slice(0, 6)
                .map((name, index) => ({ categoryId: `category-${index + 1}`, name }))
            : defaultCategories;

          return {
            data: {
              heroBanners: [
                {
                  id: 'freshmart-hero',
                  title: 'Fresh picks from the live FreshMart catalog',
                  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-adUk9ZXoP0nwAjwNtfGOr5P5qjDPIVpu8m4Vdaa6rmvZfYCO8DrhUiWkCkEnkpBPf1hfACU0i6X4MHnjn7tn-qBqG7UElO4IZ5vYD0IWUdFEAe2ip_JZ7Yp1O9uS8XCIqy2c7zeTw-OaD5NBWTNh6gpnJ6MRMmOsn5Xp4t19iMDNLrTPk3eGmAMwiXK6Cn7VNBFe7yb3RUV4_NhlxvGXwNZ1vgb3V8NLRbAsu8FSsIwEUkSt1lvC2fVszOZFfpGkbLz5-M5Xbopo'
                }
              ],
              categories,
              featuredProducts,
              trendingProducts: featuredProducts.slice(0, 4),
              offers: [],
              recommendedProducts: featuredProducts.slice(0, 4),
              recentlyViewed: [],
              cartSummary: {
                itemCount: Array.isArray((cartResponse as { data?: { items?: unknown[] } })?.data?.items)
                  ? (cartResponse as { data: { items: unknown[] } }).data.items.length
                  : 0,
                grandTotal: Number((cartResponse as { data?: { totalAmount?: number; grandTotal?: number } })?.data?.totalAmount ?? (cartResponse as { data?: { grandTotal?: number } })?.data?.grandTotal ?? 0)
              }
            }
          };
        } catch (error) {
          return { error: toApiError(error) };
        }
      }
    }),
    addHomeProductToCart: builder.mutation<Record<string, unknown>, { productId: string }>({
      queryFn: async ({ productId }) => {
        try {
          const product = unwrap(await sdk.catalog.getProduct(productId)) as { data?: Record<string, unknown> } | Record<string, unknown>;
          const detail = typeof product === 'object' && product !== null && 'data' in product
            ? product.data as Record<string, unknown>
            : product as Record<string, unknown>;

          return {
            data: await sdk.cart.saveCart({
              productId,
              quantity: 1,
              price: Number(detail.price ?? 0),
              productName: String(detail.productName ?? detail.name ?? productId),
              imageUrl: typeof detail.imageUrl === 'string'
                ? detail.imageUrl
                : Array.isArray(detail.images) && typeof detail.images[0] === 'string'
                  ? detail.images[0]
                  : undefined,
              available: Boolean(detail.available ?? true)
            })
          };
        } catch (error) {
          return { error: toApiError(error) };
        }
      }
    })
  }),
  overrideExisting: false
});

export const { useAddHomeProductToCartMutation, useGetCustomerHomeQuery } = homeApi;
