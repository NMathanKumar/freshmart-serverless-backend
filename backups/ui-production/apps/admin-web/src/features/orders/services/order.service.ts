import { freshmartSdk } from '../../../lib/sdk';
import type { AdminOrder, AdminOrderStatus } from '@freshmart/api-sdk';

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
}

export class OrderService {
  async listOrders(params: OrderListParams = {}): Promise<OrderModel[]> {
    let rawOrders: AdminOrder[] = [];
    const res = await freshmartSdk.admin.listOrders({
      page: params.page || 1,
      limit: params.limit || 50,
      search: params.search,
      status: params.status && params.status !== 'All Orders' ? (params.status.toUpperCase() as AdminOrderStatus) : undefined,
    });
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

      return {
        id: ord.orderId?.startsWith('#') ? ord.orderId : `#${ord.orderId || 'FM-001'}`,
        customerName: ord.customer?.name || 'Customer',
        customerEmail: ord.customer?.email || 'customer@example.com',
        productsCount: `${ord.itemsCount || ord.items?.length || 1} Items`,
        date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Oct 18, 2024',
        amount: `$${(ord.totalAmount || 0).toFixed(2)}`,
        rawAmount: ord.totalAmount || 0,
        paymentStatus: (ord.paymentStatus === 'SUCCESS' ? 'Paid' : 'Pending') as OrderModel['paymentStatus'],
        orderStatus: orderStatusFormatted,
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

    if (params.status && params.status !== 'All Orders') {
      filtered = filtered.filter((o) => {
        if (params.status === 'Pending') return o.orderStatus === 'PENDING';
        if (params.status === 'Processing') return o.orderStatus === 'PROCESSING';
        if (params.status === 'Shipped') return o.orderStatus === 'SHIPPED';
        if (params.status === 'Delivered') return o.orderStatus === 'DELIVERED';
        return true;
      });
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
      statusBadgeText: ord.orderStatus,
      statusBadgeBg: 'bg-[#e6f7ec]',
      statusBadgeColor: 'text-[#04883b]',
    };
  }

  async updateOrderStatus(orderId: string, status: AdminOrderStatus): Promise<void> {
    try {
      await freshmartSdk.admin.updateOrderStatus(orderId, status);
    } catch (err) {
      console.warn('updateOrderStatus error:', err);
    }
  }

  async updateOrder(orderId: string, data: Partial<AdminOrder>): Promise<void> {
    try {
      await freshmartSdk.admin.updateOrder(orderId, data);
    } catch (err) {
      console.warn('updateOrder error:', err);
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      await freshmartSdk.admin.deleteOrder(orderId);
    } catch (err) {
      console.warn('deleteOrder error:', err);
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
