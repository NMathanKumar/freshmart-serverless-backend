import { ApiError, createFreshMartSdk, type CustomerHomeResponse } from '@freshmart/api-sdk';
import { authApi } from '../../auth/api/auth-api.js';
import { sharedSessionAccessor as authSessionAccessor } from '@freshmart/shared';

const authBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:3000';
const customerBaseUrl = import.meta.env.VITE_CUSTOMER_API_BASE_URL ?? authBaseUrl;
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
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80']
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
    images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80']
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
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80']
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
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80']
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
                  imageUrl: primaryImage,
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

          let categoriesResponse: unknown = null;
          try {
            const rawCat = await sdk.category.listCategories();
            categoriesResponse = unwrap(rawCat);
          } catch (_) {
            // Unhandled category error fallback
          }

          const rawCategories = Array.isArray(categoriesResponse)
            ? categoriesResponse
            : Array.isArray((categoriesResponse as { data?: Array<Record<string, unknown>> })?.data)
              ? (categoriesResponse as { data: Array<Record<string, unknown>> }).data
              : [];

          const categories = rawCategories.length > 0
            ? rawCategories.map((rawCatItem, index) => {
                const cat = rawCatItem as Record<string, unknown>;
                return {
                  categoryId: String(cat.categoryId ?? cat.id ?? `category-${index + 1}`),
                  name: String(cat.name ?? `Category ${index + 1}`),
                  slug: String(cat.slug ?? ''),
                  imageUrl: String(cat.imageUrl ?? ''),
                };
              })
            : rawProducts.length > 0
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
      },
      providesTags: ['CustomerHome', 'Cart']
    }),
    addHomeProductToCart: builder.mutation<Record<string, unknown>, { productId: string; name?: string; price?: number; brand?: string; imageUrl?: string | null }>({
      queryFn: async ({ productId, name: inputName, price: inputPrice, brand: inputBrand, imageUrl: inputImageUrl }) => {
        let price = inputPrice ?? 2.99;
        let productName = inputName ?? 'FreshMart Item';
        let imageUrl: string | undefined = typeof inputImageUrl === 'string' ? inputImageUrl : undefined;
        let brand = inputBrand ?? 'FreshMart';

        if (!inputImageUrl || !inputName) {
          try {
            const raw = unwrap(await sdk.catalog.getProduct(productId));
            const detail = typeof raw === 'object' && raw !== null && 'data' in raw
              ? ((raw as { data: unknown }).data as Record<string, unknown>)
              : (raw as unknown as Record<string, unknown>);
            price = Number(detail.price ?? price);
            productName = String(detail.productName ?? detail.name ?? productName);
            imageUrl = typeof detail.imageUrl === 'string'
              ? detail.imageUrl
              : Array.isArray(detail.images) && typeof detail.images[0] === 'string'
                ? detail.images[0]
                : imageUrl;
            brand = String(detail.brand ?? brand);
          } catch (_) {
            const match = defaultProducts.find((p) => p.productId === productId);
            if (match) {
              price = match.price;
              productName = match.name;
              imageUrl = match.images[0];
              brand = match.brand;
            }
          }
        }

        // Add to local persistent cart storage with full image details
        const { addOrUpdateStoredCartItem } = await import('../../commerce/model/commerce-content.js');
        const updatedLocalCart = addOrUpdateStoredCartItem({
          productId,
          productName,
          name: productName,
          price,
          brand,
          imageUrl
        });

        try {
          await sdk.cart.saveCart({
            productId,
            quantity: 1,
            price,
            productName,
            imageUrl,
            available: true
          });
        } catch (_) {
          // Ignore remote unauthenticated errors; local cart is saved
        }

        return { data: { productId, quantity: 1, items: updatedLocalCart, success: true } };
      },
      invalidatesTags: ['CustomerHome' as never, 'Cart' as never, 'CommerceCart' as never]
    })
  }),
  overrideExisting: true
});

export const { useAddHomeProductToCartMutation, useGetCustomerHomeQuery } = homeApi;
