import type { AuthSession } from '@freshmart/shared';
export interface CategorySummary {
    categoryId: string;
    name: string;
}
export interface ProductSummary {
    productId: string;
    productName: string;
    description?: string | null;
    category: string;
    brand?: string | null;
    price: number;
    images: string[];
    available: boolean;
    weight?: number | null;
    unit?: string | null;
    stock: number;
    createdAt?: string | null;
    updatedAt?: string | null;
    version?: number;
}
export interface ApiEnvelope<TData> {
    success: boolean;
    message: string;
    data: TData;
    timestamp: string;
    requestId: string | null;
    meta?: Record<string, unknown>;
}
export interface InventorySummary {
    inventoryId?: string | null;
    productId: string;
    currentStock: number;
    minimumStock: number;
    reservedStock?: number;
    availableStock?: number;
    unit?: string | null;
    status?: 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    isLowStock: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
}
export interface InventoryUpdateRequest {
    currentStock: number;
    minimumStock: number;
    unit: string;
}
export interface CartSnapshot {
    itemCount: number;
    grandTotal: number;
    items?: Array<Record<string, unknown>>;
}
export interface CustomerHomeResponse {
    heroBanners: Array<{
        id: string;
        title: string;
        imageUrl: string;
    }>;
    categories: CategorySummary[];
    featuredProducts: ProductSummary[];
    trendingProducts: ProductSummary[];
    offers: Array<{
        code: string;
        title: string;
        discountPercentage: number;
    }>;
    recommendedProducts: ProductSummary[];
    recentlyViewed: Array<{
        productId: string;
        name: string;
    }>;
    cartSummary: CartSnapshot;
}
export interface CustomerProfileResponse {
    user: Record<string, unknown>;
    recentOrders: Record<string, unknown>[];
    wishlistSummary: {
        totalItems: number;
    };
    addresses: Record<string, unknown>[];
}
export interface CustomerCheckoutResponse {
    cart: Record<string, unknown>;
    address: Record<string, unknown> | null;
    deliveryEstimate: string;
    availablePaymentMethods: string[];
    discounts: Array<Record<string, unknown>>;
}
export interface WishlistResponse {
    items: Array<Record<string, unknown>>;
}
export interface NotificationsResponse {
    notifications: Array<Record<string, unknown>>;
}
export interface AdminDashboardData {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    failedPayments: number;
    lowStockEvents: number;
    lowStockCount: number;
    outOfStockCount: number;
    recentOrders: AdminDashboardOrder[];
    inventoryAlerts: AdminInventoryAlert[];
    topSellingProducts: AdminTopSellingProduct[];
    notificationsSent: number;
    analyticsUpdates: number;
    dailyReportsGenerated: number;
    userRegistrations: number;
    lastEventType?: string | null;
    lastEventId?: string | null;
    lastUpdatedAt?: string | null;
}
export interface AdminDashboardOrder {
    orderId: string;
    customerId: string;
    customerName: string;
    itemsCount: number;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string | null;
    updatedAt: string | null;
}
export interface AdminInventoryAlert {
    productId: string;
    productName: string;
    currentStock: number;
    minimumStock: number;
    availableStock: number;
    status: string;
    updatedAt: string | null;
}
export interface AdminTopSellingProduct {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
}
export type AdminOrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type AdminOrderPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export interface AdminOrderCustomer {
    customerId: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    addresses: unknown[];
}
export interface AdminOrderItem {
    productId: string;
    productName?: string | null;
    quantity: number;
    price: number;
    imageUrl?: string | null;
    lineTotal?: number;
}
export interface AdminOrder {
    orderId: string;
    customer: AdminOrderCustomer;
    items: AdminOrderItem[];
    itemsCount: number;
    itemImages: string[];
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
    paymentStatus: AdminOrderPaymentStatus | null;
    paymentMethod: null;
    orderStatus: AdminOrderStatus;
    deliveryStatus: null;
    pickupTime: string | null;
    shippingAddress: null;
    statusHistory: null;
    createdAt: string | null;
    updatedAt: string | null;
    version: number;
}
export interface AdminOrderSummary {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    revenue: number;
}
export interface AdminOrderListMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    summary: AdminOrderSummary;
}
export type AdminOrderListResponse = Omit<ApiEnvelope<AdminOrder[]>, 'meta'> & {
    meta: AdminOrderListMeta;
};
export interface AdminOrderListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: AdminOrderStatus;
    paymentStatus?: AdminOrderPaymentStatus;
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'orderId';
    sortOrder?: 'asc' | 'desc';
}
export type AdminCustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export interface AdminCustomerStatistics {
    orderCount: number;
    totalSpending: number;
    lastOrderDate: string | null;
    paidOrderCount: number;
}
export interface AdminCustomerOrderSummary {
    total: number;
    paid: number;
    pending: number;
    cancelled: number;
}
export interface AdminCustomerRecentOrder {
    orderId: string;
    orderStatus: string | null;
    paymentStatus: string | null;
    totalAmount: number;
    createdAt: string | null;
}
export interface AdminCustomer {
    customerId: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    registrationDate: string | null;
    updatedAt: string | null;
    status: AdminCustomerStatus | null;
    defaultAddress: unknown | null;
    addresses: unknown[];
    orderCount: number;
    totalSpending: number;
    lastOrderDate: string | null;
    statistics?: AdminCustomerStatistics;
    orderSummary?: AdminCustomerOrderSummary;
    recentOrders?: AdminCustomerRecentOrder[];
}
export interface AdminCustomerSummary {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    newCustomers: number;
}
export interface AdminCustomerListMeta {
    page: number;
    limit: number;
    pageSize: number;
    total: number;
    totalPages: number;
    summary: AdminCustomerSummary;
}
export type AdminCustomerListResponse = Omit<ApiEnvelope<AdminCustomer[]>, 'meta'> & {
    meta: AdminCustomerListMeta;
};
export interface AdminCustomerListParams {
    page?: number;
    pageSize?: number;
    limit?: number;
    search?: string;
    status?: AdminCustomerStatus;
    sortBy?: 'registrationDate' | 'updatedAt' | 'name' | 'email' | 'orderCount' | 'totalSpending' | 'lastOrderDate';
    sortOrder?: 'asc' | 'desc';
}
export interface AdminDashboardResponse {
    adminItemId: string;
    entityType: 'DASHBOARD';
    data: AdminDashboardData;
    status: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    createdBy?: string | null;
    version: number;
}
export interface AdminEntity<TData = Record<string, unknown>> {
    adminItemId: string;
    entityType: string;
    data: TData;
    status: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    createdBy?: string | null;
    version: number;
}
export interface AdminProfileResponse {
    userId: string;
    name?: string | null;
    email: string;
    role: string;
    status: string;
    groups: string[];
    lastLoginAt?: string | null;
}
export interface AuthLoginRequest {
    email: string;
    password: string;
}
export interface AuthRegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}
export interface AuthRefreshRequest {
    refreshToken: string;
}
export interface AuthLogoutRequest {
    accessToken: string;
}
export interface AuthUserSummary {
    userId?: string;
    email?: string;
    role?: string;
    roles?: string[];
    fullName?: string;
    name?: string;
}
export interface AuthSessionResponse extends Partial<AuthSession> {
    accessToken: string;
    refreshToken: string;
    idToken?: string;
    tokenType?: string;
    user?: AuthUserSummary;
}
export interface AdminCategory {
    adminItemId: string;
    entityType: 'CATEGORY';
    data: {
        name: string;
        slug?: string;
        description?: string | null;
        imageUrl?: string | null;
        parentId?: string | null;
        productCount?: number;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface AdminReview {
    adminItemId: string;
    entityType: 'REVIEW';
    data: {
        productId: string;
        productName?: string;
        customerId: string;
        customerName?: string;
        rating: number;
        comment?: string;
        featured?: boolean;
        adminNote?: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface AdminSupplier {
    adminItemId: string;
    entityType: 'SUPPLIER';
    data: {
        name: string;
        contactPerson?: string;
        email: string;
        phone?: string;
        gstNumber?: string;
        address?: Record<string, unknown>;
        notes?: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface AdminPurchaseOrder {
    adminItemId: string;
    entityType: 'PURCHASE_ORDER';
    data: {
        supplierId: string;
        supplierName?: string;
        items: Array<{
            productId: string;
            productName?: string;
            quantity: number;
            unitCost: number;
            receivedQuantity?: number;
        }>;
        notes?: string;
        expectedAt?: string;
        totalAmount?: number;
        receivedAt?: string;
        receivedNotes?: string;
        cancelReason?: string;
        cancelledAt?: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface AdminDelivery {
    adminItemId: string;
    entityType: 'DELIVERY';
    data: {
        orderId: string;
        trackingNumber?: string;
        driverId?: string;
        driverName?: string;
        driverPhone?: string;
        statusHistory?: Array<{
            status: string;
            timestamp: string;
            note?: string;
            reason?: string;
        }>;
        cancelReason?: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface AdminListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export type AdminCategoryListResponse = ApiEnvelope<AdminCategory[]> & {
    meta: Record<string, unknown>;
};
export type AdminReviewListResponse = ApiEnvelope<AdminReview[]> & {
    meta: Record<string, unknown>;
};
export type AdminSupplierListResponse = ApiEnvelope<AdminSupplier[]> & {
    meta: Record<string, unknown>;
};
export type AdminPurchaseOrderListResponse = ApiEnvelope<AdminPurchaseOrder[]> & {
    meta: Record<string, unknown>;
};
export type AdminDeliveryListResponse = ApiEnvelope<AdminDelivery[]> & {
    meta: Record<string, unknown>;
};
