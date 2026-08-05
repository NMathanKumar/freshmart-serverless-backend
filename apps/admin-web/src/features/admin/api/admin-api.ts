import {
  createFreshMartSdk,
  type AdminDashboardResponse,
  type AdminEntity,
  type AdminDeliveryListResponse,
  type AdminCustomerListResponse,
  type AdminCustomerStatus,
  type AdminListParams,
  type AdminOrderListResponse,
  type AdminOrderStatus,
  type AdminProfileResponse,
  type AdminPurchaseOrderListResponse,
  type AdminCategory,
  type AdminReview,
  type AdminSupplierListResponse,
  type ApiEnvelope,
  type InventorySummary,
  type InventoryUpdateRequest,
  type ProductSummary
} from '@freshmart/api-sdk';
import { sharedSessionAccessor as adminSessionAccessor } from '@freshmart/shared';

const environment = import.meta.env as Record<string, string | undefined>;
const configuredBaseUrl = environment.VITE_ADMIN_API_BASE_URL ?? environment.VITE_AUTH_API_BASE_URL ?? 'http://localhost:3000';
const apiBaseUrl = configuredBaseUrl.replace(/\/+$/, '').replace(/\/v1$/, '');

export const adminSdk = createFreshMartSdk({
  adminBaseUrl: apiBaseUrl,
  authBaseUrl: apiBaseUrl,
  commerceBaseUrl: apiBaseUrl,
  sessionAccessor: adminSessionAccessor
});

export const unwrapApiData = <T,>(response: ApiEnvelope<T>) => response.data;

export const fetchDashboard = async (): Promise<AdminDashboardResponse> =>
  unwrapApiData(await adminSdk.admin.getDashboard());

export const fetchAdminConfig = async (): Promise<AdminEntity[]> =>
  Object.entries(unwrapApiData(await adminSdk.admin.getSettings())).map(([adminItemId, value]) => ({
    adminItemId,
    entityType: 'SETTING',
    data: (value && typeof value === 'object' ? value : { value }) as Record<string, unknown>,
    status: 'ACTIVE',
    createdAt: null,
    updatedAt: null,
    createdBy: null,
    version: 1
  }));

export const fetchAdminProfile = async (): Promise<AdminProfileResponse> =>
  unwrapApiData(await adminSdk.auth.me());

export const fetchProducts = async (): Promise<ProductSummary[]> =>
  unwrapApiData(await adminSdk.catalog.listProducts({ limit: 100 }));

export const fetchProductPage = async (cursor?: string, query = '') => {
  const response = query.trim()
    ? await adminSdk.catalog.searchProducts(query.trim(), 10, cursor)
    : await adminSdk.catalog.listProducts({ cursor, limit: 10 });
  return {
    items: unwrapApiData(response),
    nextCursor: typeof response.meta?.nextCursor === 'string' ? response.meta.nextCursor : undefined
  };
};

export type ProductInput = Omit<ProductSummary, 'createdAt' | 'productId' | 'updatedAt' | 'version'>;

export const createProduct = async (payload: ProductInput) =>
  unwrapApiData(await adminSdk.catalog.createProduct(payload));

export const updateProduct = async (productId: string, payload: Partial<ProductInput>) =>
  unwrapApiData(await adminSdk.catalog.updateProduct(productId, payload));

export const fetchInventory = async (page = 1): Promise<{ items: InventorySummary[]; total: number }> => {
  const response = await adminSdk.inventory.listInventory(page, 10);
  return {
    items: unwrapApiData(response),
    total: Number(response.meta?.total ?? response.data.length)
  };
};

export const fetchInventoryWorkspace = async (page = 1) => {
  const [inventory, products] = await Promise.all([fetchInventory(page), fetchProducts()]);
  return { inventory, products };
};

export const updateInventory = async (productId: string, payload: InventoryUpdateRequest) =>
  unwrapApiData(await adminSdk.inventory.updateInventory(productId, payload));

export const fetchAdminOrders = async (params: Parameters<typeof adminSdk.admin.listOrders>[0] = {}): Promise<AdminOrderListResponse> =>
  adminSdk.admin.listOrders(params);

export const updateOrderStatus = async (orderId: string, status: string) =>
  adminSdk.admin.updateOrderStatus(orderId, status as AdminOrderStatus);

export const fetchAdminCustomers = async (params: Parameters<typeof adminSdk.admin.listCustomers>[0] = {}): Promise<AdminCustomerListResponse> =>
  adminSdk.admin.listCustomers(params);

export const updateCustomerStatus = async (customerId: string, status: string) =>
  adminSdk.admin.updateCustomerStatus(customerId, status as AdminCustomerStatus);

export const fetchAdminCategories = async (params: AdminListParams = {}): Promise<ApiEnvelope<AdminCategory[]>> =>
  adminSdk.admin.listCategories(params as Record<string, unknown>);

export const createCategory = async (payload: Record<string, unknown>) =>
  adminSdk.admin.createCategory(payload);

export const updateCategory = async (id: string, payload: Record<string, unknown>) =>
  adminSdk.admin.updateCategory(id, payload);

export const deleteCategory = async (id: string) =>
  adminSdk.admin.deleteCategory(id);

export const fetchAdminReviews = async (params: AdminListParams = {}): Promise<ApiEnvelope<AdminReview[]>> =>
  adminSdk.admin.listReviews(params);

export const moderateReview = async (id: string, payload: Record<string, unknown>) =>
  adminSdk.admin.updateReview(id, payload);

export const deleteReview = async (id: string) =>
  adminSdk.admin.deleteReview(id);

export const fetchAdminSuppliers = async (params: AdminListParams = {}): Promise<AdminSupplierListResponse> =>
  adminSdk.admin.listSuppliers(params);

export const createSupplier = async (payload: Record<string, unknown>) =>
  adminSdk.admin.createSupplier(payload);

export const updateSupplier = async (id: string, payload: Record<string, unknown>) =>
  adminSdk.admin.updateSupplier(id, payload);

export const deleteSupplier = async (id: string) =>
  adminSdk.admin.deleteSupplier(id);

export const fetchAdminPurchaseOrders = async (params: AdminListParams = {}): Promise<AdminPurchaseOrderListResponse> =>
  adminSdk.admin.listPurchaseOrders(params);

export const createPurchaseOrder = async (payload: Record<string, unknown>) =>
  adminSdk.admin.createPurchaseOrder(payload);

export const updatePurchaseOrder = async (id: string, payload: Record<string, unknown>) =>
  adminSdk.admin.updatePurchaseOrder(id, payload);

export const receivePurchaseOrder = async (id: string, payload: Record<string, unknown> = {}) =>
  adminSdk.admin.receivePurchaseOrder(id, { receivedItems: (payload.receivedItems as any[]) || [], notes: payload.notes as string | undefined });

export const cancelPurchaseOrder = async (id: string) =>
  adminSdk.admin.cancelPurchaseOrder(id);

export const fetchAdminDeliveries = async (params: AdminListParams = {}): Promise<AdminDeliveryListResponse> =>
  adminSdk.admin.listDeliveries(params);

export const createDelivery = async (payload: Record<string, unknown>) =>
  adminSdk.admin.createDelivery(payload);

export const assignDeliveryDriver = async (id: string, driverId: string) =>
  adminSdk.admin.assignDriver(id, { driverId });

export const updateDeliveryStatus = async (id: string, status: string) =>
  adminSdk.admin.updateDeliveryStatus(id, { status });

export const cancelDelivery = async (id: string) =>
  adminSdk.admin.cancelDelivery(id);
