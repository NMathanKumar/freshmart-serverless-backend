import type {
  AdminCustomer,
  AdminCustomerListParams,
  AdminCustomerListResponse,
  AdminCustomerStatus,
  AdminDashboardResponse,
  AdminEntity,
  AdminOrder,
  AdminOrderListParams,
  AdminOrderListResponse,
  AdminOrderStatus,
  ApiEnvelope,
  AdminCategory,
  AdminCategoryListResponse,
  AdminReview,
  AdminReviewListResponse,
  AdminCoupon,
  AdminCouponListResponse,
  AdminSupplier,
  AdminSupplierListResponse,
  AdminPurchaseOrder,
  AdminPurchaseOrderListResponse,
  AdminDelivery,
  AdminDeliveryListResponse,
  AdminListParams,
  VendorInvoice,
  VendorInvoiceListResponse,
  PaymentRecord,
  ReturnToVendor,
  ReturnToVendorListResponse,
  ProcurementAnalyticsReport,
  ProcurementAnalyticsParams,
} from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';

export class AdminClient {
  constructor(private readonly client: ApiClient) {}

  getDashboard() {
    return this.client.request<ApiEnvelope<AdminDashboardResponse>>({
      method: 'GET',
      url: '/v1/admin/dashboard'
    });
  }

  getHealth() {
    return this.client.request<ApiEnvelope<{ service: string; status: string; timestamp: string }>>({
      method: 'GET',
      url: '/v1/admin/health'
    });
  }

  listOrders(params: AdminOrderListParams = {}, config?: any) {
    return this.client.request<AdminOrderListResponse>({
      ...config,
      method: 'GET',
      url: '/v1/admin/orders',
      params
    }).catch(async (err) => {
      if (err?.statusCode === 404 || err?.response?.status === 404) {
        return this.client.request<AdminOrderListResponse>({
          ...config,
          method: 'GET',
          url: '/api/v1/admin/orders',
          params
        });
      }
      throw err;
    });
  }

  getOrder(orderId: string) {
    return this.client.request<ApiEnvelope<AdminOrder>>({
      method: 'GET',
      url: `/v1/admin/orders/${encodeURIComponent(orderId)}`
    });
  }

  updateOrderStatus(orderId: string, orderStatus: AdminOrderStatus) {
    return this.client.request<ApiEnvelope<AdminOrder>>({
      method: 'PATCH',
      url: `/v1/admin/orders/${encodeURIComponent(orderId)}/status`,
      data: { orderStatus }
    });
  }

  updateOrder(orderId: string, data: Partial<AdminOrder>) {
    return this.client.request<ApiEnvelope<AdminOrder>>({
      method: 'PUT',
      url: `/v1/admin/orders/${encodeURIComponent(orderId)}`,
      data
    });
  }

  deleteOrder(orderId: string) {
    return this.client.request<ApiEnvelope<null>>({
      method: 'DELETE',
      url: `/v1/admin/orders/${encodeURIComponent(orderId)}`
    });
  }

  getOrderTimeline(orderId: string) {
    return this.client.request<ApiEnvelope<Array<{ status: string; timestamp: string; note?: string }>>>({
      method: 'GET',
      url: `/v1/admin/orders/${encodeURIComponent(orderId)}/timeline`
    });
  }

  getInvoice(orderId: string) {
    return this.client.request<ApiEnvelope<{ invoiceUrl: string; invoiceNumber: string }>>({
      method: 'GET',
      url: `/v1/admin/orders/${encodeURIComponent(orderId)}/invoice`
    });
  }

  getOrderStatistics() {
    return this.client.request<ApiEnvelope<Record<string, number>>>({
      method: 'GET',
      url: '/v1/admin/orders/statistics'
    });
  }

  listCustomers(params: AdminCustomerListParams = {}, config?: any) {
    return this.client.request<AdminCustomerListResponse>({
      ...config,
      method: 'GET',
      url: '/v1/admin/customers',
      params
    }).catch(async (err) => {
      if (err?.statusCode === 404 || err?.response?.status === 404) {
        return this.client.request<AdminCustomerListResponse>({
          ...config,
          method: 'GET',
          url: '/api/v1/admin/customers',
          params
        });
      }
      throw err;
    });
  }

  getCustomer(customerId: string) {
    return this.client.request<ApiEnvelope<AdminCustomer>>({
      method: 'GET',
      url: `/v1/admin/customers/${encodeURIComponent(customerId)}`
    });
  }

  updateCustomerStatus(customerId: string, status: AdminCustomerStatus) {
    return this.client.request<ApiEnvelope<AdminCustomer>>({
      method: 'PATCH',
      url: `/v1/admin/customers/${encodeURIComponent(customerId)}/status`,
      data: { status }
    });
  }

  updateCustomer(customerId: string, data: Partial<AdminCustomer>) {
    return this.client.request<ApiEnvelope<AdminCustomer>>({
      method: 'PUT',
      url: `/v1/admin/customers/${encodeURIComponent(customerId)}`,
      data
    });
  }

  deleteCustomer(customerId: string) {
    return this.client.request<ApiEnvelope<null>>({
      method: 'DELETE',
      url: `/v1/admin/customers/${encodeURIComponent(customerId)}`
    });
  }

  getCustomerOrders(customerId: string) {
    return this.client.request<ApiEnvelope<Array<Record<string, unknown>>>>({
      method: 'GET',
      url: `/v1/admin/customers/${encodeURIComponent(customerId)}/orders`
    });
  }

  getCustomerAddresses(customerId: string) {
    return this.client.request<ApiEnvelope<Array<Record<string, unknown>>>>({
      method: 'GET',
      url: `/v1/admin/customers/${encodeURIComponent(customerId)}/addresses`
    });
  }

  getCustomerStatistics() {
    return this.client.request<ApiEnvelope<Record<string, number>>>({
      method: 'GET',
      url: '/v1/admin/customers/statistics'
    });
  }

  // --- Analytics ---
  getAnalyticsDashboard(params: Record<string, unknown> = {}, config?: any) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      ...config,
      method: 'GET',
      url: '/v1/admin/analytics/dashboard',
      params
    });
  }

  getRevenueAnalytics(params: Record<string, unknown> = {}, config?: any) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      ...config,
      method: 'GET',
      url: '/v1/admin/analytics/revenue',
      params
    });
  }

  getOrderAnalytics(params: Record<string, unknown> = {}, config?: any) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      ...config,
      method: 'GET',
      url: '/v1/admin/analytics/orders',
      params
    });
  }

  getProductAnalytics(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/analytics/products',
      params
    });
  }

  getCustomerAnalytics(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/analytics/customers',
      params
    });
  }

  getCategoryAnalytics(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/analytics/categories',
      params
    });
  }

  getInventoryAnalytics(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/analytics/inventory',
      params
    });
  }

  exportAnalyticsReport(format: 'csv' | 'excel' | 'pdf' = 'csv') {
    return this.client.request<ApiEnvelope<{ downloadUrl: string; fileName: string }>>({
      method: 'GET',
      url: '/v1/admin/analytics/export',
      params: { format }
    });
  }

  // --- Reports ---
  listReports(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Array<Record<string, unknown>>>>({
      method: 'GET',
      url: '/v1/admin/reports',
      params
    });
  }

  getSalesReport(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/reports/sales',
      params
    });
  }

  getOrdersReport(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/reports/orders',
      params
    });
  }

  getCustomersReport(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/reports/customers',
      params
    });
  }

  getInventoryReport(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/reports/inventory',
      params
    });
  }

  getProductsReport(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({
      method: 'GET',
      url: '/v1/admin/reports/products',
      params
    });
  }

  exportReport(payload: { reportType: string; format: 'csv' | 'excel' | 'pdf'; dateRange?: string }) {
    return this.client.request<ApiEnvelope<{ reportId: string; downloadUrl: string; fileName: string }>>({
      method: 'POST',
      url: '/v1/admin/reports/export',
      data: payload
    });
  }

  downloadReport(reportId: string) {
    return this.client.request<ApiEnvelope<{ downloadUrl: string; fileName: string }>>({
      method: 'GET',
      url: `/v1/admin/reports/download/${encodeURIComponent(reportId)}`
    });
  }

  // --- Categories ---
  listCategories(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<AdminCategory[]>>({ method: 'GET', url: '/v1/admin/categories', params });
  }
  getCategory(id: string) {
    return this.client.request<ApiEnvelope<AdminCategory>>({ method: 'GET', url: `/v1/admin/categories/${encodeURIComponent(id)}` });
  }
  createCategory(data: Partial<AdminCategory['data']> & { status?: string }) {
    return this.client.request<ApiEnvelope<AdminCategory>>({ method: 'POST', url: '/v1/admin/categories', data });
  }
  updateCategory(id: string, data: Partial<AdminCategory['data']> & { status?: string }) {
    return this.client.request<ApiEnvelope<AdminCategory>>({ method: 'PUT', url: `/v1/admin/categories/${encodeURIComponent(id)}`, data });
  }
  deleteCategory(id: string) {
    return this.client.request<ApiEnvelope<null>>({ method: 'DELETE', url: `/v1/admin/categories/${encodeURIComponent(id)}` });
  }
  uploadCategoryImage(fileName: string, contentType: string) {
    return this.client.request<ApiEnvelope<{ uploadUrl: string; imageUrl: string }>>({ method: 'POST', url: '/v1/admin/categories/upload-url', data: { fileName, contentType } });
  }

  // --- Suppliers ---
  listSuppliers(params: AdminListParams = {}) {
    return this.client.request<AdminSupplierListResponse>({
      method: 'GET',
      url: '/v1/admin/suppliers',
      params
    });
  }

  getSupplier(supplierId: string) {
    return this.client.request<ApiEnvelope<AdminSupplier>>({
      method: 'GET',
      url: `/v1/admin/suppliers/${encodeURIComponent(supplierId)}`
    });
  }

  createSupplier(data: Partial<AdminSupplier['data']>) {
    return this.client.request<ApiEnvelope<AdminSupplier>>({
      method: 'POST',
      url: '/v1/admin/suppliers',
      data
    });
  }

  updateSupplier(supplierId: string, data: Partial<AdminSupplier['data']>) {
    return this.client.request<ApiEnvelope<AdminSupplier>>({
      method: 'PUT',
      url: `/v1/admin/suppliers/${encodeURIComponent(supplierId)}`,
      data
    });
  }

  updateSupplierStatus(supplierId: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') {
    return this.client.request<ApiEnvelope<AdminSupplier>>({
      method: 'PATCH',
      url: `/v1/admin/suppliers/${encodeURIComponent(supplierId)}/status`,
      data: { status }
    });
  }

  deleteSupplier(supplierId: string) {
    return this.client.request<ApiEnvelope<null>>({
      method: 'DELETE',
      url: `/v1/admin/suppliers/${encodeURIComponent(supplierId)}`
    });
  }

  // --- Reviews ---
  listReviews(params: AdminListParams = {}) {
    return this.client.request<AdminReviewListResponse>({ method: 'GET', url: '/v1/admin/reviews', params });
  }
  getReview(id: string) {
    return this.client.request<ApiEnvelope<AdminReview>>({ method: 'GET', url: `/v1/admin/reviews/${encodeURIComponent(id)}` });
  }
  updateReview(id: string, data: Partial<AdminReview['data']>) {
    return this.client.request<ApiEnvelope<AdminReview>>({ method: 'PATCH', url: `/v1/admin/reviews/${encodeURIComponent(id)}`, data });
  }
  updateReviewStatus(id: string, status: string) {
    return this.client.request<ApiEnvelope<AdminReview>>({ method: 'PATCH', url: `/v1/admin/reviews/${encodeURIComponent(id)}/status`, data: { status } });
  }
  deleteReview(id: string) {
    return this.client.request<ApiEnvelope<null>>({ method: 'DELETE', url: `/v1/admin/reviews/${encodeURIComponent(id)}` });
  }
  getReviewStatistics() {
    return this.client.request<ApiEnvelope<Record<string, number>>>({ method: 'GET', url: '/v1/admin/reviews/statistics' });
  }

  // --- Coupons ---
  listCoupons(params: AdminListParams = {}) {
    return this.client.request<AdminCouponListResponse>({ method: 'GET', url: '/v1/admin/coupons', params });
  }
  getCoupon(id: string) {
    return this.client.request<AdminCoupon>({ method: 'GET', url: `/v1/admin/coupons/${encodeURIComponent(id)}` });
  }
  createCoupon(data: Partial<AdminCoupon>) {
    return this.client.request<AdminCoupon>({ method: 'POST', url: '/v1/admin/coupons', data });
  }
  updateCoupon(id: string, data: Partial<AdminCoupon>) {
    return this.client.request<AdminCoupon>({ method: 'PUT', url: `/v1/admin/coupons/${encodeURIComponent(id)}`, data });
  }
  updateCouponStatus(id: string, status: string) {
    return this.client.request<ApiEnvelope<AdminCoupon>>({ method: 'PATCH', url: `/v1/admin/coupons/${encodeURIComponent(id)}/status`, data: { status } });
  }
  deleteCoupon(id: string) {
    return this.client.request<ApiEnvelope<null>>({ method: 'DELETE', url: `/v1/admin/coupons/${encodeURIComponent(id)}` });
  }
  getConfig() {
    return this.client.request<ApiEnvelope<AdminEntity[]>>({ method: 'GET', url: '/v1/admin/config' });
  }


  // --- Purchase Orders ---
  listPurchaseOrders(params: AdminListParams = {}) {
    return this.client.request<AdminPurchaseOrderListResponse>({ method: 'GET', url: '/v1/admin/purchase-orders', params });
  }
  getPurchaseOrder(id: string) {
    return this.client.request<ApiEnvelope<AdminPurchaseOrder>>({ method: 'GET', url: `/v1/admin/purchase-orders/${encodeURIComponent(id)}` });
  }
  createPurchaseOrder(data: Partial<AdminPurchaseOrder['data']>) {
    return this.client.request<ApiEnvelope<AdminPurchaseOrder>>({ method: 'POST', url: '/v1/admin/purchase-orders', data });
  }
  updatePurchaseOrder(id: string, data: Partial<AdminPurchaseOrder['data']>) {
    return this.client.request<ApiEnvelope<AdminPurchaseOrder>>({ method: 'PUT', url: `/v1/admin/purchase-orders/${encodeURIComponent(id)}`, data });
  }
  submitPurchaseOrder(id: string) {
    return this.client.request<ApiEnvelope<AdminPurchaseOrder>>({ method: 'PATCH', url: `/v1/admin/purchase-orders/${encodeURIComponent(id)}/submit` });
  }
  approvePurchaseOrder(id: string, data?: { notes?: string }) {
    return this.client.request<ApiEnvelope<AdminPurchaseOrder>>({ method: 'PATCH', url: `/v1/admin/purchase-orders/${encodeURIComponent(id)}/approve`, data });
  }
  rejectPurchaseOrder(id: string, data: { reason: string }) {
    return this.client.request<ApiEnvelope<AdminPurchaseOrder>>({ method: 'PATCH', url: `/v1/admin/purchase-orders/${encodeURIComponent(id)}/reject`, data });
  }
  receivePurchaseOrder(id: string, data: { receivedItems: any[]; notes?: string }) {
    return this.client.request<ApiEnvelope<AdminPurchaseOrder>>({ method: 'PATCH', url: `/v1/admin/purchase-orders/${encodeURIComponent(id)}/receive`, data });
  }
  cancelPurchaseOrder(id: string, data?: { reason?: string }) {
    return this.client.request<ApiEnvelope<AdminPurchaseOrder>>({ method: 'PATCH', url: `/v1/admin/purchase-orders/${encodeURIComponent(id)}/cancel`, data });
  }

  // --- Notifications ---
  listNotifications(params: Record<string, unknown> = {}) {
    return this.client.request<ApiEnvelope<Array<Record<string, unknown>>>>({ method: 'GET', url: '/v1/admin/notifications', params });
  }
  getNotification(id: string) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'GET', url: `/v1/admin/notifications/${encodeURIComponent(id)}` });
  }
  markNotificationRead(id: string) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'PATCH', url: `/v1/admin/notifications/${encodeURIComponent(id)}/read` });
  }
  archiveNotification(id: string) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'PATCH', url: `/v1/admin/notifications/${encodeURIComponent(id)}/archive` });
  }
  deleteNotification(id: string) {
    return this.client.request<ApiEnvelope<null>>({ method: 'DELETE', url: `/v1/admin/notifications/${encodeURIComponent(id)}` });
  }
  getNotificationStatistics() {
    return this.client.request<ApiEnvelope<Record<string, number>>>({ method: 'GET', url: '/v1/admin/notifications/statistics' });
  }

  // --- Profile & Settings ---
  getProfile() {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'GET', url: '/v1/admin/profile' });
  }
  updateProfile(data: Record<string, unknown>) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'PUT', url: '/v1/admin/profile', data });
  }
  changePassword(data: Record<string, unknown>) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'PUT', url: '/v1/admin/profile/password', data });
  }
  uploadProfileAvatar(fileName: string, contentType: string) {
    return this.client.request<ApiEnvelope<{ uploadUrl: string; avatarUrl: string }>>({ method: 'POST', url: '/v1/admin/profile/avatar/upload-url', data: { fileName, contentType } });
  }
  getSettings() {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'GET', url: '/v1/admin/settings' });
  }
  updateSettings(data: Record<string, unknown>) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'PUT', url: '/v1/admin/settings', data });
  }
  getSecuritySettings() {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'GET', url: '/v1/admin/settings/security' });
  }
  updateSecuritySettings(data: Record<string, unknown>) {
    return this.client.request<ApiEnvelope<Record<string, unknown>>>({ method: 'PUT', url: '/v1/admin/settings/security', data });
  }

  // --- Deliveries ---
  listDeliveries(params: AdminListParams = {}) {
    return this.client.request<AdminDeliveryListResponse>({ method: 'GET', url: '/v1/admin/deliveries', params });
  }
  getDelivery(id: string) {
    return this.client.request<ApiEnvelope<AdminDelivery>>({ method: 'GET', url: `/v1/admin/deliveries/${encodeURIComponent(id)}` });
  }
  createDelivery(data: Partial<AdminDelivery['data']>) {
    return this.client.request<ApiEnvelope<AdminDelivery>>({ method: 'POST', url: '/v1/admin/deliveries', data });
  }
  updateDeliveryStatus(id: string, data: { status: string; note?: string }) {
    return this.client.request<ApiEnvelope<AdminDelivery>>({ method: 'PATCH', url: `/v1/admin/deliveries/${encodeURIComponent(id)}/status`, data });
  }
  assignDriver(id: string, data: { driverId: string; driverName?: string; driverPhone?: string }) {
    return this.client.request<ApiEnvelope<AdminDelivery>>({ method: 'POST', url: `/v1/admin/deliveries/${encodeURIComponent(id)}/assign`, data });
  }
  cancelDelivery(id: string, data?: { reason?: string }) {
    return this.client.request<ApiEnvelope<AdminDelivery>>({ method: 'POST', url: `/v1/admin/deliveries/${encodeURIComponent(id)}/cancel`, data });
  }

  // --- Vendor Invoices & Accounts Payable ---
  listVendorInvoices(params: AdminListParams = {}) {
    return this.client.request<VendorInvoiceListResponse>({ method: 'GET', url: '/v1/admin/vendor-invoices', params });
  }
  getVendorInvoice(id: string) {
    return this.client.request<ApiEnvelope<VendorInvoice>>({ method: 'GET', url: `/v1/admin/vendor-invoices/${encodeURIComponent(id)}` });
  }
  createVendorInvoice(data: Partial<VendorInvoice>) {
    return this.client.request<ApiEnvelope<VendorInvoice>>({ method: 'POST', url: '/v1/admin/vendor-invoices', data });
  }
  updateVendorInvoice(id: string, data: Partial<VendorInvoice>) {
    return this.client.request<ApiEnvelope<VendorInvoice>>({ method: 'PUT', url: `/v1/admin/vendor-invoices/${encodeURIComponent(id)}`, data });
  }
  submitVendorInvoice(id: string) {
    return this.client.request<ApiEnvelope<VendorInvoice>>({ method: 'PUT', url: `/v1/admin/vendor-invoices/${encodeURIComponent(id)}/submit` });
  }
  approveVendorInvoice(id: string, data?: { remarks?: string }) {
    return this.client.request<ApiEnvelope<VendorInvoice>>({ method: 'PUT', url: `/v1/admin/vendor-invoices/${encodeURIComponent(id)}/approve`, data });
  }
  rejectVendorInvoice(id: string, data: { rejectionReason: string }) {
    return this.client.request<ApiEnvelope<VendorInvoice>>({ method: 'PUT', url: `/v1/admin/vendor-invoices/${encodeURIComponent(id)}/reject`, data });
  }
  cancelVendorInvoice(id: string, data: { cancelReason: string }) {
    return this.client.request<ApiEnvelope<VendorInvoice>>({ method: 'PUT', url: `/v1/admin/vendor-invoices/${encodeURIComponent(id)}/cancel`, data });
  }
  recordVendorPayment(id: string, data: Partial<PaymentRecord>) {
    return this.client.request<ApiEnvelope<VendorInvoice>>({ method: 'POST', url: `/v1/admin/vendor-invoices/${encodeURIComponent(id)}/payments`, data });
  }

  // --- Return to Vendor (RTV) ---
  listVendorReturns(params: AdminListParams = {}) {
    return this.client.request<ReturnToVendorListResponse>({ method: 'GET', url: '/v1/admin/vendor-returns', params });
  }
  getVendorReturn(id: string) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'GET', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}` });
  }
  createVendorReturn(data: Partial<ReturnToVendor>) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'POST', url: '/v1/admin/vendor-returns', data });
  }
  updateVendorReturn(id: string, data: Partial<ReturnToVendor>) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}`, data });
  }
  submitVendorReturn(id: string) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}/submit` });
  }
  approveVendorReturn(id: string, data?: { remarks?: string }) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}/approve`, data });
  }
  rejectVendorReturn(id: string, data: { rejectionReason: string }) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}/reject`, data });
  }
  dispatchVendorReturn(id: string, data: { dispatchDate: string; carrier?: string; trackingNumber?: string; vehicleNumber?: string; remarks?: string }) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}/dispatch`, data });
  }
  vendorReceivedReturn(id: string, data: { receivedDate: string; receivedBy?: string; remarks?: string; qualityInspection?: { status: string; remarks?: string; inspector?: string; inspectionDate?: string } }) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}/vendor-received`, data });
  }
  recordReturnCreditNote(id: string, data: { creditNoteNumber: string; creditNoteDate: string; creditNoteAmount: number; invoiceId: string; remarks?: string }) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}/credit-note`, data });
  }
  closeVendorReturn(id: string) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}/close` });
  }
  cancelVendorReturn(id: string, data: { cancelReason: string }) {
    return this.client.request<ApiEnvelope<ReturnToVendor>>({ method: 'PUT', url: `/v1/admin/vendor-returns/${encodeURIComponent(id)}/cancel`, data });
  }

  // --- Procurement Analytics ---
  getProcurementAnalytics(params: ProcurementAnalyticsParams = {}) {
    return this.client.request<ApiEnvelope<ProcurementAnalyticsReport>>({ method: 'GET', url: '/v1/analytics/procurement', params });
  }

  autoGeneratePurchaseOrders(data: { productId: string; supplierId: string; warehouseId: string; recommendedQty: number; unitCost: number }[]) {
    return this.client.request<ApiEnvelope<any[]>>({ method: 'POST', url: '/v1/admin/purchase-orders/auto-generate', data });
  }
}
