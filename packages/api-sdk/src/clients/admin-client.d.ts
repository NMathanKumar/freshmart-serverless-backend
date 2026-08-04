import type { AdminCustomer, AdminCustomerListParams, AdminCustomerListResponse, AdminCustomerStatus, AdminDashboardResponse, AdminEntity, AdminOrder, AdminOrderListParams, AdminOrderListResponse, AdminOrderStatus, ApiEnvelope, AdminCategory, AdminCategoryListResponse, AdminReview, AdminReviewListResponse, AdminCoupon, AdminCouponListResponse, AdminSupplier, AdminSupplierListResponse, AdminPurchaseOrder, AdminPurchaseOrderListResponse, AdminDelivery, AdminDeliveryListResponse, AdminListParams } from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';
export declare class AdminClient {
    private readonly client;
    constructor(client: ApiClient);
    getDashboard(): Promise<ApiEnvelope<AdminDashboardResponse>>;
    getHealth(): Promise<ApiEnvelope<{
        service: string;
        status: string;
        timestamp: string;
    }>>;
    listOrders(params?: AdminOrderListParams): Promise<AdminOrderListResponse>;
    getOrder(orderId: string): Promise<ApiEnvelope<AdminOrder>>;
    updateOrderStatus(orderId: string, orderStatus: AdminOrderStatus): Promise<ApiEnvelope<AdminOrder>>;
    listCustomers(params?: AdminCustomerListParams): Promise<AdminCustomerListResponse>;
    getCustomer(customerId: string): Promise<ApiEnvelope<AdminCustomer>>;
    updateCustomerStatus(customerId: string, status: AdminCustomerStatus): Promise<ApiEnvelope<AdminCustomer>>;
    getConfig(): Promise<ApiEnvelope<AdminEntity<Record<string, unknown>>[]>>;
    updateConfig(payload: {
        configKey: string;
        data: Record<string, unknown>;
        status?: string;
    }): Promise<ApiEnvelope<AdminEntity<Record<string, unknown>>>>;
    getAudit(params?: {
        eventType?: string;
        status?: string;
    }): Promise<ApiEnvelope<AdminEntity<Record<string, unknown>>[]>>;
    listCategories(params?: AdminListParams): Promise<AdminCategoryListResponse>;
    getCategory(id: string): Promise<ApiEnvelope<AdminCategory>>;
    createCategory(data: Partial<AdminCategory['data']>): Promise<ApiEnvelope<AdminCategory>>;
    updateCategory(id: string, data: Partial<AdminCategory['data']>): Promise<ApiEnvelope<AdminCategory>>;
    deleteCategory(id: string): Promise<ApiEnvelope<null>>;
    listReviews(params?: AdminListParams): Promise<AdminReviewListResponse>;
    getReview(id: string): Promise<ApiEnvelope<AdminReview>>;
    updateReview(id: string, data: Partial<AdminReview['data']> & {
        status?: string;
    }): Promise<ApiEnvelope<AdminReview>>;
    deleteReview(id: string): Promise<ApiEnvelope<null>>;
    listCoupons(params?: AdminListParams): Promise<AdminCouponListResponse>;
    getCoupon(id: string): Promise<ApiEnvelope<AdminCoupon>>;
    createCoupon(data: Partial<AdminCoupon['data']>): Promise<ApiEnvelope<AdminCoupon>>;
    updateCoupon(id: string, data: Partial<AdminCoupon['data']>): Promise<ApiEnvelope<AdminCoupon>>;
    updateCouponStatus(id: string, status: string): Promise<ApiEnvelope<AdminCoupon>>;
    deleteCoupon(id: string): Promise<ApiEnvelope<null>>;
    listSuppliers(params?: AdminListParams): Promise<AdminSupplierListResponse>;
    getSupplier(id: string): Promise<ApiEnvelope<AdminSupplier>>;
    createSupplier(data: Partial<AdminSupplier['data']>): Promise<ApiEnvelope<AdminSupplier>>;
    updateSupplier(id: string, data: Partial<AdminSupplier['data']>): Promise<ApiEnvelope<AdminSupplier>>;
    deleteSupplier(id: string): Promise<ApiEnvelope<null>>;
    listPurchaseOrders(params?: AdminListParams): Promise<AdminPurchaseOrderListResponse>;
    getPurchaseOrder(id: string): Promise<ApiEnvelope<AdminPurchaseOrder>>;
    createPurchaseOrder(data: Partial<AdminPurchaseOrder['data']>): Promise<ApiEnvelope<AdminPurchaseOrder>>;
    updatePurchaseOrder(id: string, data: Partial<AdminPurchaseOrder['data']>): Promise<ApiEnvelope<AdminPurchaseOrder>>;
    receivePurchaseOrder(id: string, data: {
        receivedItems: any[];
        notes?: string;
    }): Promise<ApiEnvelope<AdminPurchaseOrder>>;
    cancelPurchaseOrder(id: string, data?: {
        reason?: string;
    }): Promise<ApiEnvelope<AdminPurchaseOrder>>;
    listDeliveries(params?: AdminListParams): Promise<AdminDeliveryListResponse>;
    getDelivery(id: string): Promise<ApiEnvelope<AdminDelivery>>;
    createDelivery(data: Partial<AdminDelivery['data']>): Promise<ApiEnvelope<AdminDelivery>>;
    updateDeliveryStatus(id: string, data: {
        status: string;
        note?: string;
    }): Promise<ApiEnvelope<AdminDelivery>>;
    assignDriver(id: string, data: {
        driverId: string;
        driverName?: string;
        driverPhone?: string;
    }): Promise<ApiEnvelope<AdminDelivery>>;
    cancelDelivery(id: string, data?: {
        reason?: string;
    }): Promise<ApiEnvelope<AdminDelivery>>;
}
