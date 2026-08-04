import type { AdminCollectionView, DashboardView, SettingsView } from '../entities/index.js';
import type { DashboardCacheRepository } from '../repositories/index.js';

export interface AdminGateway {
  getDashboard(authorization?: string): Promise<DashboardView>;
  getInventory(authorization?: string): Promise<AdminCollectionView>;
  getAnalytics(authorization?: string): Promise<AdminCollectionView>;
  getOrders(authorization?: string): Promise<AdminCollectionView>;
  getProducts(authorization?: string): Promise<AdminCollectionView>;
  getCustomers(authorization?: string): Promise<AdminCollectionView>;
  getReports(authorization?: string): Promise<AdminCollectionView>;
  getSettings(authorization?: string): Promise<SettingsView>;
}

export class AdminBffService {
  constructor(
    private readonly gateway: AdminGateway,
    private readonly cache: DashboardCacheRepository
  ) {}

  async getDashboard(authorization?: string): Promise<DashboardView> {
    const cached = await this.cache.getDashboard();
    if (cached) {
      return cached;
    }
    const dashboard = await this.gateway.getDashboard(authorization);
    await this.cache.saveDashboard(dashboard);
    return dashboard;
  }

  async getInventory(authorization?: string): Promise<AdminCollectionView> {
    return this.gateway.getInventory(authorization);
  }

  async getAnalytics(authorization?: string): Promise<AdminCollectionView> {
    return this.gateway.getAnalytics(authorization);
  }

  async getOrders(authorization?: string): Promise<AdminCollectionView> {
    return this.gateway.getOrders(authorization);
  }

  async getProducts(authorization?: string): Promise<AdminCollectionView> {
    return this.gateway.getProducts(authorization);
  }

  async getCustomers(authorization?: string): Promise<AdminCollectionView> {
    return this.gateway.getCustomers(authorization);
  }

  async getReports(authorization?: string): Promise<AdminCollectionView> {
    return this.gateway.getReports(authorization);
  }

  async getSettings(authorization?: string): Promise<SettingsView> {
    return this.gateway.getSettings(authorization);
  }
}

export class StaticAdminGateway implements AdminGateway {
  async getDashboard(): Promise<DashboardView> {
    return {
      todaysRevenue: 145000,
      todaysOrders: 682,
      pendingOrders: 47,
      inventoryAlerts: 18,
      bestSellingProducts: [{ productId: 'prod-1', name: 'Organic Banana', unitsSold: 221 }],
      revenueAnalytics: [{ interval: '10:00', revenue: 12000 }],
      lowStockAlerts: [{ sku: 'BANANA-1KG', availableStock: 9 }],
      recentActivity: [{ timestamp: new Date().toISOString(), description: 'Warehouse Bengaluru flagged a low stock alert.' }]
    };
  }

  async getInventory(): Promise<AdminCollectionView> { return { items: [] }; }
  async getAnalytics(): Promise<AdminCollectionView> { return { items: [] }; }
  async getOrders(): Promise<AdminCollectionView> { return { items: [] }; }
  async getProducts(): Promise<AdminCollectionView> { return { items: [] }; }
  async getCustomers(): Promise<AdminCollectionView> { return { items: [] }; }
  async getReports(): Promise<AdminCollectionView> { return { items: [] }; }
  async getSettings(): Promise<SettingsView> { return { cmsPages: [], promotions: [] }; }
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export class HttpAdminGateway implements AdminGateway {
  constructor(
    private readonly config: {
      analyticsBaseUrl: string;
      inventoryBaseUrl: string;
      orderBaseUrl: string;
      productBaseUrl: string;
      userBaseUrl: string;
      cmsBaseUrl: string;
      promotionsBaseUrl: string;
    }
  ) {}

  private async request<TResponse>(baseUrl: string, path: string, authorization?: string): Promise<TResponse> {
    const response = await fetch(`${trimTrailingSlash(baseUrl)}${path}`, {
      headers: authorization ? { authorization } : {}
    });
    if (!response.ok) {
      throw new Error(`Admin BFF downstream request failed for ${path} with status ${response.status}.`);
    }
    return (await response.json()) as TResponse;
  }

  async getDashboard(authorization?: string): Promise<DashboardView> {
    const [analytics, orders, inventory, products] = await Promise.all([
      this.request<Array<Record<string, unknown>>>(this.config.analyticsBaseUrl, '/api/v1/analytics/snapshots', authorization),
      this.request<Array<Record<string, unknown>>>(this.config.orderBaseUrl, '/api/v1/orders', authorization),
      this.request<Array<Record<string, unknown>>>(this.config.inventoryBaseUrl, '/api/v1/inventory/items', authorization),
      this.request<Array<Record<string, unknown>>>(this.config.productBaseUrl, '/v1/products', authorization)
    ]);

    return {
      todaysRevenue: analytics[0] ? Number(analytics[0].revenue ?? 0) : 0,
      todaysOrders: orders.length,
      pendingOrders: orders.filter((order) => String(order.status ?? '') !== 'COMPLETED').length,
      inventoryAlerts: inventory.filter((item) => Number(item.availableStock ?? 0) <= Number(item.restockThreshold ?? 0)).length,
      bestSellingProducts: products.slice(0, 5).map((product) => ({
        productId: String(product.productId ?? ''),
        name: String(product.name ?? ''),
        unitsSold: Number(product.unitsSold ?? 0)
      })),
      revenueAnalytics: analytics.slice(0, 8).map((snapshot) => ({
        interval: String(snapshot.dateKey ?? ''),
        revenue: Number(snapshot.revenue ?? 0)
      })),
      lowStockAlerts: inventory
        .filter((item) => Number(item.availableStock ?? 0) <= Number(item.restockThreshold ?? 0))
        .slice(0, 10)
        .map((item) => ({ sku: String(item.sku ?? ''), availableStock: Number(item.availableStock ?? 0) })),
      recentActivity: orders.slice(0, 10).map((order) => ({
        timestamp: String(order.updatedAt ?? new Date().toISOString()),
        description: `Order ${String(order.orderId ?? '')} is ${String(order.status ?? '')}.`
      }))
    };
  }

  async getInventory(authorization?: string): Promise<AdminCollectionView> {
    return { items: await this.request<Array<Record<string, unknown>>>(this.config.inventoryBaseUrl, '/api/v1/inventory/items', authorization) };
  }

  async getAnalytics(authorization?: string): Promise<AdminCollectionView> {
    return { items: await this.request<Array<Record<string, unknown>>>(this.config.analyticsBaseUrl, '/api/v1/analytics/snapshots', authorization) };
  }

  async getOrders(authorization?: string): Promise<AdminCollectionView> {
    return { items: await this.request<Array<Record<string, unknown>>>(this.config.orderBaseUrl, '/api/v1/orders', authorization) };
  }

  async getProducts(authorization?: string): Promise<AdminCollectionView> {
    return { items: await this.request<Array<Record<string, unknown>>>(this.config.productBaseUrl, '/v1/products', authorization) };
  }

  async getCustomers(authorization?: string): Promise<AdminCollectionView> {
    return { items: [await this.request<Record<string, unknown>>(this.config.userBaseUrl, '/api/v1/users/profile', authorization)] };
  }

  async getReports(authorization?: string): Promise<AdminCollectionView> {
    return { items: await this.request<Array<Record<string, unknown>>>(this.config.analyticsBaseUrl, '/api/v1/analytics/snapshots', authorization) };
  }

  async getSettings(authorization?: string): Promise<SettingsView> {
    const [cmsPages, promotions] = await Promise.all([
      this.request<Array<Record<string, unknown>>>(this.config.cmsBaseUrl, '/api/v1/cms/pages', authorization),
      this.request<Array<Record<string, unknown>>>(this.config.promotionsBaseUrl, '/api/v1/promotions', authorization)
    ]);
    return { cmsPages, promotions };
  }
}
