import { freshmartSdk } from '../../../lib/sdk';

export interface ReportItemModel {
  id: string;
  title: string;
  category: 'Sales' | 'Orders' | 'Customers' | 'Inventory' | 'Products';
  generatedAt: string;
  fileSize: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  downloadUrl?: string;
}

export interface ReportListParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class ReportsService {
  async listReports(params: ReportListParams = {}): Promise<ReportItemModel[]> {
    const res = await freshmartSdk.admin.listReports(params as Record<string, unknown>);
    const rawItems = (res?.data || (res as any)?.items || (Array.isArray(res) ? res : [])) as Array<Record<string, any>>;

    const mapped = rawItems.map((r, idx) => {
      const sampleCategories: Array<ReportItemModel['category']> = ['Sales', 'Orders', 'Customers', 'Inventory', 'Products'];
      const sampleFormats: Array<ReportItemModel['format']> = ['PDF', 'CSV', 'XLSX'];
      const cat = (r.category || sampleCategories[idx % sampleCategories.length]) as ReportItemModel['category'];
      const fmt = (r.format || sampleFormats[idx % sampleFormats.length]) as ReportItemModel['format'];

      return {
        id: r.reportId || `RPT-2024-00${idx + 1}`,
        title: r.title || `${cat} Overview Report`,
        category: cat,
        generatedAt: r.generatedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        fileSize: r.fileSize || '1.5 MB',
        format: fmt,
        status: (r.status || 'COMPLETED') as ReportItemModel['status'],
        downloadUrl: r.downloadUrl,
      };
    });

    let filtered = mapped;
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) => r.title.toLowerCase().includes(query) || r.id.toLowerCase().includes(query)
      );
    }

    if (params.category && params.category !== 'All Reports') {
      filtered = filtered.filter((r) => r.category === params.category);
    }

    return filtered;
  }

  async getSalesReport(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getSalesReport(params);
    return res.data ?? {};
  }

  async getOrdersReport(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getSalesReport(params);
    return res.data ?? {};
  }

  async getCustomerReport(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await (freshmartSdk.admin as any).getCustomersReport(params);
    return res?.data ?? {};
  }

  async getCustomersReport(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await (freshmartSdk.admin as any).getCustomersReport(params);
    return res?.data ?? {};
  }

  async getInventoryReport(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getInventoryReport(params);
    return res.data ?? {};
  }

  async getProductsReport(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getInventoryReport(params);
    return res.data ?? {};
  }

  async generateReport(payload: Record<string, unknown>): Promise<{ reportId: string; status: string }> {
    const res = await (freshmartSdk.admin as any).generateReport?.(payload);
    return res?.data || { reportId: `RPT-${Date.now()}`, status: 'PROCESSING' };
  }

  async exportReport(payload: Record<string, unknown>): Promise<{ reportId: string; downloadUrl: string; fileName: string }> {
    const res = await freshmartSdk.admin.downloadReport((payload.reportId as string) || 'RPT-001');
    return { reportId: (payload.reportId as string) || 'RPT-001', downloadUrl: res.data.downloadUrl, fileName: 'report.pdf' };
  }

  async downloadReport(reportId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const res = await freshmartSdk.admin.downloadReport(reportId);
    return { downloadUrl: res.data.downloadUrl, fileName: `${reportId}.pdf` };
  }
}

export const reportsService = new ReportsService();
