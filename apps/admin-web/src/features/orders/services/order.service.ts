import { freshmartSdk } from '../../../lib/sdk';
import type { AdminOrder, AdminOrderStatus } from '@freshmart/api-sdk';
import { Logger } from '@/shared/utils/logger';

export interface OrderModel {
  id: string;
  customerName: string;
  customerEmail: string;
  productsCount: string;
  date: string;
  amount: string;
  rawAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  orderStatus: 'DELIVERED' | 'PROCESSING' | 'PENDING' | 'CANCELLED' | 'SHIPPED';
  rawOrderStatus: AdminOrderStatus;
  statusBadgeText: string;
  statusBadgeBg: string;
  statusBadgeColor: string;
}

export interface OrderListParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export class OrderService {
  async listOrders(params: OrderListParams = {}): Promise<OrderModel[]> {
    let rawOrders: AdminOrder[] = [];
    let apiStatus: string | undefined = undefined;
    if (params.status && params.status !== 'All Orders') {
      if (params.status === 'Pending') apiStatus = 'PLACED';
      else if (params.status === 'Processing') apiStatus = 'PREPARING,ACCEPTED';
      else if (params.status === 'Shipped') apiStatus = 'READY';
      else if (params.status === 'Delivered') apiStatus = 'DELIVERED';
      else apiStatus = params.status;
    }

    const res = await freshmartSdk.admin.listOrders({
      page: params.page || 1,
      limit: params.limit || 50,
      search: params.search,
      status: apiStatus as AdminOrderStatus,
    }, { signal: params.signal });
    rawOrders = (res?.data || (res as any)?.items || (Array.isArray(res) ? res : [])) as AdminOrder[];

    const mapped: OrderModel[] = rawOrders.map((ord) => {
      let orderStatusFormatted: OrderModel['orderStatus'] = 'DELIVERED';
      let statusBadgeText = 'Delivered';
      let statusBadgeBg = 'bg-[#e6f7ec]';
      let statusBadgeColor = 'text-[#04883b]';

      if (ord.orderStatus === 'PREPARING' || ord.orderStatus === 'ACCEPTED') {
        orderStatusFormatted = 'PROCESSING';
        statusBadgeText = 'Processing';
        statusBadgeBg = 'bg-teal-50';
        statusBadgeColor = 'text-teal-600';
      } else if (ord.orderStatus === 'READY') {
        orderStatusFormatted = 'SHIPPED';
        statusBadgeText = 'Shipped';
        statusBadgeBg = 'bg-blue-50';
        statusBadgeColor = 'text-blue-600';
      } else if (ord.orderStatus === 'PLACED') {
        orderStatusFormatted = 'PENDING';
        statusBadgeText = 'Pending';
        statusBadgeBg = 'bg-amber-50';
        statusBadgeColor = 'text-amber-600';
      } else if (ord.orderStatus === 'CANCELLED') {
        orderStatusFormatted = 'CANCELLED';
        statusBadgeText = 'Cancelled';
        statusBadgeBg = 'bg-rose-50';
        statusBadgeColor = 'text-rose-600';
      }

      const name = ord.customer?.name || 'Customer';
      const email = ord.customer?.email || (name !== 'Customer' ? `${name.toLowerCase().replaceAll(' ', '')}@gmail.com` : 'customer@freshmart.com');

      return {
        id: ord.orderId?.startsWith('#') ? ord.orderId : `#${ord.orderId || 'FM-001'}`,
        customerName: name,
        customerEmail: email,
        productsCount: `${ord.itemsCount || ord.items?.length || 1} Items`,
        date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Oct 18, 2024',
        amount: `₹${(ord.totalAmount || 0).toFixed(2)}`,
        rawAmount: ord.totalAmount || 0,
        paymentStatus: (ord.paymentStatus === 'SUCCESS' ? 'Paid' : 'Pending') as OrderModel['paymentStatus'],
        orderStatus: orderStatusFormatted,
        rawOrderStatus: (ord.orderStatus || 'PLACED') as AdminOrderStatus,
        statusBadgeText,
        statusBadgeBg,
        statusBadgeColor,
      };
    });

    let filtered = mapped;
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.customerEmail.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  async getOrder(orderId: string): Promise<OrderModel> {
    const res = await freshmartSdk.admin.getOrder(orderId);
    const ord = res.data;
    return {
      id: ord.orderId,
      customerName: ord.customer?.name || 'Customer',
      customerEmail: ord.customer?.email || '',
      productsCount: `${ord.itemsCount} Items`,
      date: ord.createdAt || '',
      amount: `$${(ord.totalAmount || 0).toFixed(2)}`,
      rawAmount: ord.totalAmount,
      paymentStatus: ord.paymentStatus === 'SUCCESS' ? 'Paid' : 'Pending',
      orderStatus: ord.orderStatus === 'DELIVERED' ? 'DELIVERED' : 'PROCESSING',
      rawOrderStatus: ord.orderStatus || 'PLACED',
      statusBadgeText: ord.orderStatus,
      statusBadgeBg: 'bg-[#e6f7ec]',
      statusBadgeColor: 'text-[#04883b]',
    };
  }

  async updateOrderStatus(orderId: string, status: AdminOrderStatus): Promise<void> {
    try {
      const cleanId = orderId.replace(/^#/, '');
      await freshmartSdk.admin.updateOrderStatus(cleanId, status);
    } catch (err) {
      Logger.warn('updateOrderStatus error', { error: err, module: 'order.service' });
      throw err;
    }
  }

  async updateOrder(orderId: string, data: Partial<AdminOrder>): Promise<void> {
    try {
      const cleanId = orderId.replace(/^#/, '');
      await freshmartSdk.admin.updateOrder(cleanId, data);
    } catch (err) {
      Logger.warn('updateOrder error', { error: err, module: 'order.service' });
      throw err;
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const cleanId = orderId.replace(/^#/, '');
      await freshmartSdk.admin.deleteOrder(cleanId);
    } catch (err) {
      Logger.warn('deleteOrder error', { error: err, module: 'order.service' });
      throw err;
    }
  }

  async getOrderTimeline(orderId: string): Promise<Array<{ status: string; timestamp: string; note?: string }>> {
    const res = await freshmartSdk.admin.getOrderTimeline(orderId);
    return res.data ?? [];
  }

  async getInvoice(orderId: string): Promise<{ invoiceUrl: string; invoiceNumber: string }> {
    const res = await freshmartSdk.admin.getInvoice(orderId);
    return res.data;
  }

  async getOrderStatistics(): Promise<Record<string, number>> {
    const res = await freshmartSdk.admin.getOrderStatistics();
    return res.data ?? {};
  }
}

export const orderService = new OrderService();
