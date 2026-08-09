import { freshmartSdk } from '../../../lib/sdk';
import type { AdminPurchaseOrder } from '@freshmart/api-sdk';
import { format } from 'date-fns';

export interface PurchaseOrderItemModel {
  productId: string;
  sku: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrderModel {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string | null;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  items: PurchaseOrderItemModel[];
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  statusText: string;
  statusBadgeBg: string;
  statusBadgeColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderListParams {
  search?: string;
  status?: string;
  supplierId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type CreatePurchaseOrderInput = Partial<AdminPurchaseOrder['data']>;

function statusBadge(status: string): { statusText: string; statusBadgeBg: string; statusBadgeColor: string } {
  switch (status) {
    case 'DRAFT':
      return { statusText: 'Draft', statusBadgeBg: 'bg-slate-100', statusBadgeColor: 'text-slate-600' };
    case 'SUBMITTED':
      return { statusText: 'Pending Approval', statusBadgeBg: 'bg-amber-50', statusBadgeColor: 'text-amber-600' };
    case 'APPROVED':
      return { statusText: 'Approved', statusBadgeBg: 'bg-emerald-50', statusBadgeColor: 'text-emerald-600' };
    case 'REJECTED':
      return { statusText: 'Rejected', statusBadgeBg: 'bg-rose-50', statusBadgeColor: 'text-rose-600' };
    case 'ORDERED':
      return { statusText: 'Ordered', statusBadgeBg: 'bg-blue-50', statusBadgeColor: 'text-blue-600' };
    case 'PARTIALLY_RECEIVED':
      return { statusText: 'Partially Received', statusBadgeBg: 'bg-teal-50', statusBadgeColor: 'text-teal-600' };
    case 'RECEIVED':
      return { statusText: 'Received', statusBadgeBg: 'bg-indigo-50', statusBadgeColor: 'text-indigo-600' };
    case 'CANCELLED':
      return { statusText: 'Cancelled', statusBadgeBg: 'bg-rose-50', statusBadgeColor: 'text-rose-700' };
    default:
      return { statusText: status, statusBadgeBg: 'bg-slate-100', statusBadgeColor: 'text-slate-600' };
  }
}

function formatDate(isoString: string | null | undefined): string | null {
  if (!isoString) return null;
  try {
    return format(new Date(isoString), 'MMM dd, yyyy');
  } catch {
    return isoString;
  }
}

function toPurchaseOrderModel(s: AdminPurchaseOrder): PurchaseOrderModel {
  const d = s.data || {} as Record<string, unknown>;
  const badge = statusBadge(s.status);
  
  const items: PurchaseOrderItemModel[] = (d.items || []).map((i: any) => ({
    productId: i.productId || '',
    sku: i.sku || '',
    productName: i.productName || 'Unknown Product',
    quantityOrdered: i.quantityOrdered || 0,
    quantityReceived: i.quantityReceived || 0,
    unitPrice: i.unitPrice || 0,
    lineTotal: i.lineTotal || 0,
  }));

  return {
    id: s.adminItemId,
    poNumber: d.poNumber || s.adminItemId,
    supplierId: d.supplierId || '',
    supplierName: d.supplierName || 'Unknown Supplier',
    orderDate: formatDate(d.orderDate),
    expectedDeliveryDate: formatDate(d.expectedDeliveryDate),
    actualDeliveryDate: formatDate(d.actualDeliveryDate),
    subtotal: d.subtotal || 0,
    tax: d.tax || 0,
    shippingCost: d.shippingCost || 0,
    discount: d.discount || 0,
    totalAmount: d.totalAmount || 0,
    items,
    status: s.status as PurchaseOrderModel['status'],
    ...badge,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export class PurchaseOrderService {
  async listPurchaseOrders(params: PurchaseOrderListParams = {}): Promise<{ items: PurchaseOrderModel[]; total: number }> {
    const res = await freshmartSdk.admin.listPurchaseOrders(params as Record<string, unknown>);
    const rawItems: AdminPurchaseOrder[] = (res as any)?.data ?? [];
    const meta = (res as any)?.meta ?? {};
    
    let mapped = rawItems.map(toPurchaseOrderModel);

    // Client-side filtering fallback
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      mapped = mapped.filter(
        (s) =>
          s.poNumber.toLowerCase().includes(query) ||
          s.supplierName.toLowerCase().includes(query)
      );
    }
    if (params.status && params.status !== 'All Status') {
      const targetStatus = params.status;
      mapped = mapped.filter((s) => s.statusText === targetStatus || s.status === targetStatus.toUpperCase());
    }

    return { items: mapped, total: meta.total ?? mapped.length };
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrderModel> {
    const res = await freshmartSdk.admin.getPurchaseOrder(id);
    const s = (res as any)?.data ?? res;
    return toPurchaseOrderModel(s as AdminPurchaseOrder);
  }

  async createPurchaseOrder(data: CreatePurchaseOrderInput): Promise<PurchaseOrderModel> {
    const res = await freshmartSdk.admin.createPurchaseOrder(data);
    const s = (res as any)?.data ?? res;
    return toPurchaseOrderModel(s as AdminPurchaseOrder);
  }

  async updatePurchaseOrder(id: string, data: Partial<CreatePurchaseOrderInput>): Promise<void> {
    await freshmartSdk.admin.updatePurchaseOrder(id, data);
  }

  async submitPurchaseOrder(id: string): Promise<void> {
    await freshmartSdk.admin.submitPurchaseOrder(id);
  }

  async approvePurchaseOrder(id: string, notes?: string): Promise<void> {
    await freshmartSdk.admin.approvePurchaseOrder(id, { notes });
  }

  async rejectPurchaseOrder(id: string, reason: string): Promise<void> {
    await freshmartSdk.admin.rejectPurchaseOrder(id, { reason });
  }

  async receivePurchaseOrder(id: string, receivedItems: any[], notes?: string): Promise<void> {
    await freshmartSdk.admin.receivePurchaseOrder(id, { receivedItems, notes });
  }

  async cancelPurchaseOrder(id: string, reason?: string): Promise<void> {
    await freshmartSdk.admin.cancelPurchaseOrder(id, { reason });
  }
}

export const purchaseOrderService = new PurchaseOrderService();
