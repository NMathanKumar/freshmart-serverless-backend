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
  warehouseId?: string | null;
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
  heroBanners: Array<{ id: string; title: string; imageUrl: string }>;
  categories: CategorySummary[];
  featuredProducts: ProductSummary[];
  trendingProducts: ProductSummary[];
  offers: Array<{ code: string; title: string; discountPercentage: number }>;
  recommendedProducts: ProductSummary[];
  recentlyViewed: Array<{ productId: string; name: string }>;
  cartSummary: CartSnapshot;
}

export interface CustomerProfileResponse {
  user: Record<string, unknown>;
  recentOrders: Record<string, unknown>[];
  wishlistSummary: { totalItems: number };
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
  // Detail-only fields (present on GET /{customerId})
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
export interface AuthVerifyOtpRequest {
  email: string;
  code: string;
}

export interface AuthResendOtpRequest {
  email: string;
}

export interface AuthForgotPasswordRequest {
  email: string;
}

export interface AuthResetPasswordRequest {
  email: string;
  code: string;
  password: string;
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
  createdBy?: string;
  updatedBy?: string;
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
    // Core identity
    name: string;
    companyName?: string;
    legalName?: string;
    supplierCode?: string;

    // Tax identifiers
    gstNumber?: string;
    panNumber?: string;

    // Contact
    contactPerson?: string;
    designation?: string;
    email: string;
    phone?: string;
    alternatePhone?: string;

    // Address (flat fields for convenience)
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;

    // Business terms
    paymentTerms?: string;
    leadTimeDays?: number;

    // Catalog linkage
    supportedCategories?: string[];
    suppliedProducts?: string[];

    // Financial
    bankDetails?: {
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      accountType?: 'SAVINGS' | 'CURRENT';
      beneficiaryName?: string;
    };
    taxInformation?: {
      gstNumber?: string;
      panNumber?: string;
      taxCategory?: string;
    };

    // Notes
    notes?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version?: number;
}

export type AdminSupplierListResponse = ApiEnvelope<AdminSupplier[]> & { meta: Record<string, unknown> };

export interface AdminPurchaseOrder {
  adminItemId: string;
  entityType: 'PURCHASE_ORDER';
  data: {
    poNumber?: string;
    supplierId: string;
    supplierName?: string;
    warehouseId?: string;
    orderDate?: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    currency?: string;
    subtotal?: number;
    tax?: number;
    shippingCost?: number;
    discount?: number;
    totalAmount?: number;
    paymentTerms?: string;
    items: Array<{
      productId: string;
      sku?: string;
      productName?: string;
      quantityOrdered: number;
      quantityReceived?: number;
      unitPrice: number;
      lineTotal?: number;
    }>;
    notes?: string;
    approvalStatus?: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    cancelReason?: string;
    cancelledAt?: string;
    cancelledBy?: string;
    receiptHistory?: Array<{
      receivedAt: string;
      receivedBy?: string;
      notes?: string;
      items: Array<{ productId: string; receivedQuantity: number }>;
    }>;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
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
    statusHistory?: Array<{ status: string; timestamp: string; note?: string; reason?: string }>;
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

export type AdminCategoryListResponse = { items: AdminCategory[] };
export type AdminReviewListResponse = { items: AdminReview[] };
export type AdminPurchaseOrderListResponse = ApiEnvelope<AdminPurchaseOrder[]> & { meta: Record<string, unknown> };
export type AdminDeliveryListResponse = ApiEnvelope<AdminDelivery[]> & { meta: Record<string, unknown> };
export type AdminWarehouseListResponse = ApiEnvelope<AdminWarehouse[]> & { meta?: Record<string, unknown> };

export interface AdminWarehouse {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  operatingHours?: string;
  capacity: {
    maxStorageCapacity: number;
    currentUtilization: number;
    utilizationPercentage: number;
    storageUnit: string;
  };
  zones: Array<{
    zoneId: string;
    zoneName: string;
    type?: string;
  }>;
  defaultReceivingZone?: string;
  defaultDispatchZone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CLOSED';
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  integrationHooks?: {
    supportedOrderTypes?: string[];
    pickupEnabled?: boolean;
    deliveryEnabled?: boolean;
    refrigerationAvailable?: boolean;
    priority?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type TransferStatus = 'DRAFT' | 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED' | 'REJECTED';

export interface TransferHistory {
  status: TransferStatus;
  changedBy: string;
  changedAt: string;
  remarks?: string;
}

export interface TransferItem {
  productId: string;
  sku?: string;
  batchNumber?: string | null;
  expiryDate?: string | null;
  unitCost?: number;
  lineTotal?: number;
  requestedQty: number;
  reservedQty: number;
  dispatchedQty: number;
  receivedQty: number;
  remainingQty: number;
}

export interface Transfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  status: TransferStatus;
  approvalStatus?: string;
  approvalLevel?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestedBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  dispatchedBy?: string;
  receivedBy?: string;
  expectedDispatchDate?: string | null;
  expectedArrivalDate?: string | null;
  actualDispatchDate?: string | null;
  actualArrivalDate?: string | null;
  remarks?: string | null;
  dispatchRemarks?: string | null;
  receivingRemarks?: string | null;
  vehicleNumber?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  totalItems: number;
  totalQuantity: number;
  items: TransferItem[];
  statusHistory: TransferHistory[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type TransferSummary = Pick<Transfer, 'id' | 'transferNumber' | 'sourceWarehouseId' | 'destinationWarehouseId' | 'status' | 'priority' | 'totalItems' | 'totalQuantity' | 'createdAt'>;
export type TransferListResponse = ApiEnvelope<Transfer[]> & { meta?: Record<string, unknown> };

export type PaymentTerms = 'NET_7' | 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'DUE_ON_RECEIPT' | 'ADVANCE';
export type InvoiceStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'PARTIALLY_PAID' | 'PAID';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERPAID';

export interface TaxBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  tds: number;
}

export interface VendorInvoiceItem {
  productId: string;
  sku?: string | null;
  description?: string | null;
  quantity: number;
  unitCost: number;
  taxRate?: number;
  discount?: number;
  lineTotal: number;
}

export interface PaymentRecord {
  paymentId: string;
  paymentDate: string;
  amount: number;
  method: 'BANK_TRANSFER' | 'CHEQUE' | 'UPI' | 'CREDIT_CARD' | 'CASH';
  referenceNumber: string;
  bankName?: string | null;
  remarks?: string | null;
  paidBy: string;
  recordedAt: string;
}

export interface VendorInvoice {
  adminItemId: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierId: string;
  purchaseOrderId: string;
  warehouseId?: string | null;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  status: InvoiceStatus;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalLevel?: string;
  approvedBy?: string;
  approvedAt?: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxBreakdown?: TaxBreakdown;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  otherCharges: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  creditNoteAmount: number;
  adjustedAmount: number;
  items: VendorInvoiceItem[];
  payments: PaymentRecord[];
  attachments?: Array<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    documentType: string;
  }>;
  remarks?: string | null;
  statusHistory?: Array<{ status: string; action: string; changedBy: string; changedAt: string; remarks?: string }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export type VendorInvoiceListResponse = ApiEnvelope<{
  items: VendorInvoice[];
  total: number;
  page: number;
  limit: number;
}>;

export type ReturnStatus = 'DRAFT' | 'REQUESTED' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED_BY_VENDOR' | 'CREDIT_NOTE_RECEIVED' | 'CLOSED' | 'REJECTED' | 'CANCELLED';

export type ReturnReasonCode = 'DEFECTIVE' | 'DAMAGED' | 'WRONG_ITEM' | 'QUALITY_ISSUE' | 'EXPIRED' | 'EXCESS_SUPPLY' | 'OTHER';

export type InspectionStatus = 'PASSED' | 'FAILED' | 'PARTIAL';

export interface ReturnItem {
  productId: string;
  sku?: string | null;
  description?: string | null;
  quantityReturned: number;
  unitCost: number;
  reason?: string | null;
  lineTotal: number;
}

export interface InspectionRecord {
  status: InspectionStatus;
  remarks?: string | null;
  inspector?: string | null;
  inspectionDate?: string | null;
}

export interface CreditNoteRecord {
  creditNoteId: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  creditNoteAmount: number;
  invoiceId: string;
  remarks?: string | null;
  recordedBy: string;
  recordedAt: string;
}

export interface DispatchRecord {
  dispatchDate: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  vehicleNumber?: string | null;
  dispatchedBy: string;
  remarks?: string | null;
  dispatchedAt: string;
}

export interface ReturnToVendor {
  adminItemId: string;
  returnId: string;
  returnNumber: string;
  supplierId: string;
  purchaseOrderId: string;
  warehouseId?: string | null;
  reasonCode: ReturnReasonCode;
  status: ReturnStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  totalAmount: number;
  creditNoteAmount: number;
  items: ReturnItem[];
  attachments?: Array<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    documentType: string;
  }>;
  qualityInspection?: InspectionRecord | null;
  dispatchHistory?: DispatchRecord[];
  creditNoteHistory?: CreditNoteRecord[];
  statusHistory?: Array<{ status: string; action: string; changedBy: string; changedAt: string; remarks?: string }>;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export type ReturnToVendorListResponse = ApiEnvelope<{
  items: ReturnToVendor[];
  total: number;
  page: number;
  limit: number;
}>;

export interface ProcurementTrend {
  date: string;
  totalPurchaseOrders: number;
  totalPurchaseValue: number;
  totalApprovedPurchaseOrders: number;
  totalReceivedPurchaseValue: number;
  totalVendorReturns: number;
  totalReturnValue: number;
  totalCreditRecovered: number;
  outstandingPayables: number;
  procurementSpend: number;
}

export interface SupplierAnalytics {
  supplierId: string;
  supplierName?: string;
  totalSpend: number;
  onTimeDeliveryRate: number;
  returnRate: number;
}

export interface WarehouseAnalytics {
  warehouseId: string;
  warehouseName?: string;
  receivingVolume: number;
  averageProcessingTime: number;
}

export interface PaymentAging {
  current: number;
  thirtyDays: number;
  sixtyDays: number;
  ninetyDaysPlus: number;
  totalOutstanding: number;
}

export interface ReturnAnalytics {
  totalReturns: number;
  totalValue: number;
  recoveredValue: number;
  recoveryRate: number;
  topReasons: Array<{ reason: string; count: number }>;
}

export interface ProcurementAnalyticsReport {
  summary: {
    totalPurchaseOrders: number;
    totalPurchaseValue: number;
    totalVendorReturns: number;
    totalReturnValue: number;
    totalCreditRecovered: number;
    outstandingPayables: number;
    procurementSpend: number;
    averagePOCycleTime: number;
    averageLeadTime: number;
    invoiceApprovalTime: number;
  };
  dailyTrend: ProcurementTrend[];
  monthlyTrend: ProcurementTrend[];
  supplierRanking: SupplierAnalytics[];
  warehouseRanking: WarehouseAnalytics[];
  paymentAging: PaymentAging;
  returnAnalysis: ReturnAnalytics;
}

export interface ProcurementAnalyticsParams {
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  warehouseId?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface ForecastItem {
  productId: string;
  currentStock: number;
  dailyConsumption: number;
  daysOfSupply: number;
  safetyStock: number;
  reorderPoint: number;
  estimatedStockoutDate: string;
}

export interface ForecastSummary {
  totalProductsAnalyzed: number;
  productsBelowSafetyStock: number;
  productsAtStockoutRisk: number;
  items: ForecastItem[];
}

export interface ReplenishmentSuggestion {
  productId: string;
  supplierId: string;
  currentStock: number;
  dailyConsumption: number;
  leadTime: number;
  safetyStock: number;
  recommendedQty: number;
  estimatedStockoutDate: string;
  unitCost: number;
}

export interface ReplenishmentReport {
  itemsEvaluated: number;
  suggestionsGenerated: number;
  purchaseOrdersCreated: number;
  createdPurchaseOrderIds: string[];
}

export interface Fulfillment {
  fulfillmentId: string;
  orderId: string;
  warehouseId: string;
  status: 'PENDING' | 'PROCESSING' | 'PICKED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
}

export interface PickList {
  pickListId: string;
  warehouseId: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string;
  tasks: PickTask[];
  createdAt: string;
  updatedAt: string;
}

export interface PickTask {
  taskId: string;
  productId: string;
  quantity: number;
  location?: string;
  status: 'PENDING' | 'PICKED' | 'SHORT';
}

export interface Package {
  packageId: string;
  fulfillmentId: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  status: 'PACKED' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  reservationId: string;
  productId: string;
  quantity: number;
  orderId: string;
  warehouseId: string;
  status: 'RESERVED' | 'COMMITTED' | 'RELEASED';
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  shipmentId: string;
  fulfillmentId: string;
  trackingNumber?: string;
  carrier?: string;
  status: 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION';
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}
export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED'; export interface Delivery { deliveryId: string; orderId: string; partnerId?: string; status: DeliveryStatus; recipientName: string; deliveryAddress: string; createdAt?: string; updatedAt?: string; }

export interface Role {
  roleId: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  permissionId: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  activityId: string;
  userId: string;
  userEmail: string;
  role: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  requestId?: string;
  ipAddress?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsDashboardResponse {
  cards: Record<string, any>;
  charts: Record<string, any>;
  recentOrders: any[];
  lowStock: any[];
  deliveryMetrics: Record<string, any>;
}
