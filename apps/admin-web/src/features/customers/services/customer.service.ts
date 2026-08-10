import { freshmartSdk } from '../../../lib/sdk';
import type { AdminCustomer, AdminCustomerStatus } from '@freshmart/api-sdk';

export interface CustomerModel {
  id: string;
  displayId?: string;
  name: string;
  email: string;
  contact: string;
  regDate: string;
  orders: number;
  spending: string;
  rawSpending: number;
  status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
  avatar: string;
}

export interface CustomerListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export class CustomerService {
  async listCustomers(params: CustomerListParams = {}): Promise<CustomerModel[]> {
    let rawCustomers: AdminCustomer[] = [];
    const res = await freshmartSdk.admin.listCustomers({
      page: params.page || 1,
      limit: params.limit || 50,
      search: params.search,
      status: params.status && params.status !== 'All Customers' ? (params.status.toUpperCase() as AdminCustomerStatus) : undefined,
    }, { signal: params.signal });
    rawCustomers = (res?.data || (res as any)?.items || (Array.isArray(res) ? res : [])) as AdminCustomer[];

    const mapped: CustomerModel[] = rawCustomers.map((c, idx) => {
      const isBlocked = c.status === 'BLOCKED';
      const sampleAvatars = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      ];

      const realId = c.customerId || `CUST-00${idx + 1}`;
      const shortDisplay = realId.startsWith('CUST-') ? realId : `CUST-${realId.substring(0, 8)}`;

      const formatAddress = (addr: any) => {
        if (!addr) return '';
        if (typeof addr === 'string') return addr;
        const parts = [
          addr.line1 || addr.street,
          addr.line2,
          addr.city,
          addr.state,
          addr.postalCode
        ].filter(Boolean);
        return parts.join(', ');
      };

      const defaultAddr = c.defaultAddress || (Array.isArray(c.addresses) ? c.addresses[0] : null);
      const formattedAddress = formatAddress(defaultAddr);
      const phoneDisplay = c.phone ? c.phone : '';
      const contactDisplay = phoneDisplay && formattedAddress
        ? `${phoneDisplay} • ${formattedAddress}`
        : phoneDisplay || formattedAddress || 'No contact details';

      return {
        id: realId,
        displayId: shortDisplay,
        name: c.name || 'Customer',
        email: c.email || 'user@example.com',
        contact: contactDisplay,
        regDate: c.registrationDate
          ? new Date(c.registrationDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : 'Jan 15, 2023',
        orders: c.orderCount ?? 0,
        spending: `$${(c.totalSpending || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        rawSpending: c.totalSpending || 0,
        status: isBlocked ? ('BLOCKED' as const) : ('ACTIVE' as const),
        avatar: c.avatarUrl || sampleAvatars[idx % sampleAvatars.length],
      };
    });

    let filtered = mapped;
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
      );
    }

    if (params.status && params.status !== 'All Customers') {
      filtered = filtered.filter((c) => {
        if (params.status === 'Active') return c.status === 'ACTIVE';
        if (params.status === 'Blocked') return c.status === 'BLOCKED';
        return true;
      });
    }

    return filtered;
  }

  async getCustomer(customerId: string): Promise<CustomerModel> {
    const res = await freshmartSdk.admin.getCustomer(customerId);
    const c = res.data;
    return {
      id: c.customerId,
      name: c.name || '',
      email: c.email || '',
      contact: c.phone || '',
      regDate: c.registrationDate || '',
      orders: c.orderCount || 0,
      spending: `$${(c.totalSpending || 0).toFixed(2)}`,
      rawSpending: c.totalSpending || 0,
      status: c.status === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
      avatar: c.avatarUrl || '',
    };
  }

  async createCustomer(data: Partial<AdminCustomer>): Promise<void> {
    await freshmartSdk.admin.createCustomer(data);
  }

  async updateCustomer(customerId: string, data: Partial<AdminCustomer>): Promise<void> {
    await freshmartSdk.admin.updateCustomer(customerId, data);
  }

  async updateCustomerStatus(customerId: string, status: string): Promise<void> {
    await freshmartSdk.admin.updateCustomer(customerId, { status } as any);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    await freshmartSdk.admin.deleteCustomer(customerId);
  }

  async getCustomerOrders(customerId: string): Promise<Array<Record<string, unknown>>> {
    const res = await freshmartSdk.admin.getCustomerOrders(customerId);
    return res.data ?? [];
  }

  async getCustomerAddresses(customerId: string): Promise<Array<Record<string, unknown>>> {
    const res = await freshmartSdk.admin.getCustomerAddresses(customerId);
    return res.data ?? [];
  }

  async getCustomerStatistics(): Promise<Record<string, number>> {
    const res = await freshmartSdk.admin.getCustomerStatistics();
    return res.data ?? {};
  }
}

export const customerService = new CustomerService();
