import { freshmartSdk } from '../../../lib/sdk';
import type { AdminSupplier } from '@freshmart/api-sdk';

export interface SupplierModel {
  id: string;
  name: string;
  companyName: string;
  supplierCode: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone: string;
  gstNumber: string;
  panNumber: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  paymentTerms: string;
  leadTimeDays: number | null;
  supportedCategories: string[];
  notes: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  statusText: string;
  statusBadgeBg: string;
  statusBadgeColor: string;
  createdAt: string;
}

export interface SupplierListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSupplierInput {
  name: string;
  companyName?: string;
  legalName?: string;
  supplierCode?: string;
  contactPerson?: string;
  designation?: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  gstNumber?: string;
  panNumber?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  paymentTerms?: string;
  leadTimeDays?: number;
  supportedCategories?: string[];
  notes?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

function statusBadge(status: string): { statusText: string; statusBadgeBg: string; statusBadgeColor: string } {
  switch (status) {
    case 'ACTIVE':
      return { statusText: 'Active', statusBadgeBg: 'bg-[#e6f7ec]', statusBadgeColor: 'text-[#04883b]' };
    case 'BLOCKED':
      return { statusText: 'Blocked', statusBadgeBg: 'bg-rose-50', statusBadgeColor: 'text-rose-700' };
    default:
      return { statusText: 'Inactive', statusBadgeBg: 'bg-slate-100', statusBadgeColor: 'text-slate-600' };
  }
}

function toSupplierModel(s: AdminSupplier): SupplierModel {
  const d = s.data || {} as Record<string, unknown>;
  const badge = statusBadge(s.status);
  return {
    id: s.adminItemId,
    name: d.name || '',
    companyName: d.companyName || d.name || '',
    supplierCode: d.supplierCode || s.adminItemId,
    contactPerson: d.contactPerson || '',
    designation: d.designation || '',
    email: d.email || '',
    phone: d.phone || '',
    alternatePhone: d.alternatePhone || '',
    gstNumber: d.gstNumber || '',
    panNumber: d.panNumber || '',
    city: d.city || d.address?.city || '',
    state: d.state || d.address?.state || '',
    country: d.country || d.address?.country || '',
    postalCode: d.postalCode || d.address?.postalCode || '',
    paymentTerms: d.paymentTerms || '',
    leadTimeDays: d.leadTimeDays ?? null,
    supportedCategories: d.supportedCategories || [],
    notes: d.notes || '',
    status: s.status as SupplierModel['status'],
    ...badge,
    createdAt: s.createdAt,
  };
}

export class SuppliersService {
  async listSuppliers(params: SupplierListParams = {}): Promise<{ items: SupplierModel[]; total: number }> {
    const res = await freshmartSdk.admin.listSuppliers(params as Record<string, unknown>);
    const rawItems: AdminSupplier[] = (res as any)?.data ?? [];
    const meta = (res as any)?.meta ?? {};
    let mapped = rawItems.map(toSupplierModel);

    // Client-side filtering (supplement server-side)
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      mapped = mapped.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.companyName.toLowerCase().includes(query) ||
          s.contactPerson.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.supplierCode.toLowerCase().includes(query) ||
          s.gstNumber.toLowerCase().includes(query)
      );
    }

    if (params.status && params.status !== 'All Status') {
      const targetStatus = params.status;
      mapped = mapped.filter((s) => s.statusText === targetStatus || s.status === targetStatus.toUpperCase());
    }

    return { items: mapped, total: meta.total ?? mapped.length };
  }

  async getSupplier(id: string): Promise<SupplierModel> {
    const res = await freshmartSdk.admin.getSupplier(id);
    const s = (res as any)?.data ?? res;
    return toSupplierModel(s as AdminSupplier);
  }

  async createSupplier(data: CreateSupplierInput): Promise<SupplierModel> {
    const res = await freshmartSdk.admin.createSupplier(data as unknown as Partial<AdminSupplier['data']>);
    const s = (res as any)?.data ?? res;
    return toSupplierModel(s as AdminSupplier);
  }

  async updateSupplier(id: string, data: Partial<CreateSupplierInput>): Promise<void> {
    await freshmartSdk.admin.updateSupplier(id, data as unknown as Partial<AdminSupplier['data']>);
  }

  async updateSupplierStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'): Promise<void> {
    await freshmartSdk.admin.updateSupplierStatus(id, status);
  }

  async deleteSupplier(id: string): Promise<void> {
    await freshmartSdk.admin.deleteSupplier(id);
  }
}

export const suppliersService = new SuppliersService();
