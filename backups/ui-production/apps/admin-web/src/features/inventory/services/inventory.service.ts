import { freshmartSdk } from '../../../lib/sdk';
import { productService } from '../../products/services/product.service';
import type { InventorySummary, MovementSummary, InventoryAdjustmentPayload } from '@freshmart/api-sdk';

export interface InventoryModel {
  id: string;
  name: string;
  sku: string;
  category: string;
  warehouse: string;
  stock: number;
  maxStock: number;
  reserved: number;
  unit: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  image: string;
  createdAt: string;
}

export type MovementModel = MovementSummary;
export type AdjustmentPayload = InventoryAdjustmentPayload;

export interface InventoryListParams {
  search?: string;
  category?: string;
  warehouse?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface MovementListParams {
  page?: number;
  limit?: number;
  warehouseId?: string;
  movementType?: string;
}

export class InventoryService {
  async listInventory(params: InventoryListParams = {}): Promise<InventoryModel[]> {
    // 1. Fetch remote inventory data
    const response = await freshmartSdk.inventory.listInventory(params.page, params.limit);
    const rawItems = response.data || [];

    // 2. We need product metadata (name, sku, category) which is stored in the catalog
    // and warehouse metadata
    let catalogProducts: any[] = [];
    let warehousesMap = new Map<string, string>();
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        productService.listProducts(),
        freshmartSdk.warehouse.listWarehouses()
      ]);
      catalogProducts = productsRes;
      const warehouses = warehousesRes.data || [];
      warehouses.forEach(w => warehousesMap.set(w.warehouseId, w.warehouseName || w.warehouseCode || 'Unknown'));
    } catch (err) {
      console.warn('Failed to fetch catalog/warehouse data for inventory mapping:', err);
    }

    // 3. Map SDK `InventorySummary` to UI `InventoryModel`
    let items: InventoryModel[] = rawItems.map((inv) => {
      const product = catalogProducts.find((p) => p.id === inv.productId) || {
        name: 'Unknown Product',
        sku: 'UNKNOWN',
        category: 'Uncategorized',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&auto=format&fit=crop&q=80'
      };

      let mappedStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
      if (inv.status === 'OUT_OF_STOCK') mappedStatus = 'OUT_OF_STOCK';
      else if (inv.status === 'LOW_STOCK' || (inv as any).isLowStock) mappedStatus = 'LOW_STOCK';
      else if (inv.currentStock === 0) mappedStatus = 'OUT_OF_STOCK';

      return {
        id: inv.productId,
        name: product.name,
        sku: product.sku,
        category: product.category,
        warehouse: inv.warehouseId ? warehousesMap.get(inv.warehouseId) || inv.warehouseId : 'Unassigned',
        stock: inv.currentStock,
        maxStock: inv.minimumStock ? inv.minimumStock * 3 : 150,
        reserved: inv.reservedStock || 0,
        unit: inv.unit || 'units',
        status: mappedStatus,
        image: product.image,
        createdAt: inv.createdAt || new Date().toISOString()
      };
    });

    // 4. Apply Frontend Filters
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.toLowerCase();
      items = items.filter(
        (inv) =>
          inv.name.toLowerCase().includes(query) ||
          inv.sku.toLowerCase().includes(query) ||
          inv.id.toLowerCase().includes(query)
      );
    }

    if (params.category && params.category !== 'All Categories') {
      items = items.filter((inv) => inv.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params.warehouse && params.warehouse !== 'All Warehouses') {
      items = items.filter((inv) => inv.warehouse === params.warehouse);
    }

    if (params.status && params.status !== 'All Status') {
      items = items.filter((inv) => {
        if (params.status === 'In Stock') return inv.status === 'IN_STOCK';
        if (params.status === 'Low Stock') return inv.status === 'LOW_STOCK';
        if (params.status === 'Out of Stock') return inv.status === 'OUT_OF_STOCK';
        return true;
      });
    }

    return items;
  }

  async getInventory(id: string): Promise<InventoryModel> {
    const list = await this.listInventory();
    return list.find((i) => i.id === id) || ({} as InventoryModel);
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    await freshmartSdk.inventory.updateStock(id, newStock);
  }

  async updateInventory(
    id: string,
    stock: number,
    minStock?: number,
    unit?: string
  ): Promise<InventoryModel> {
    await freshmartSdk.inventory.updateInventory(id, { currentStock: stock, minimumStock: minStock || 10, unit: unit || 'pcs' });
    return this.getInventory(id);
  }

  async deleteInventory(id: string): Promise<void> {
    await freshmartSdk.inventory.deleteInventory(id);
  }

  async getLowStock(): Promise<InventoryModel[]> {
    const list = await this.listInventory();
    return list.filter((i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK');
  }

  // Movements & Adjustments
  async listAllMovements(params: MovementListParams = {}): Promise<MovementModel[]> {
    const response = await freshmartSdk.inventory.listAllMovements(params);
    return response.data;
  }

  async getInventoryHistory(productId: string, params: MovementListParams = {}): Promise<MovementModel[]> {
    const response = await freshmartSdk.inventory.getInventoryHistory(productId, params);
    return response.data;
  }

  async adjustStock(productId: string, payload: AdjustmentPayload): Promise<InventoryModel> {
    await freshmartSdk.inventory.adjustStock(productId, payload);
    return this.getInventory(productId);
  }

  async adjustDamage(productId: string, payload: AdjustmentPayload): Promise<InventoryModel> {
    await freshmartSdk.inventory.adjustDamage(productId, payload);
    return this.getInventory(productId);
  }

  async adjustExpired(productId: string, payload: AdjustmentPayload): Promise<InventoryModel> {
    await freshmartSdk.inventory.adjustExpired(productId, payload);
    return this.getInventory(productId);
  }

  async adjustCycleCount(productId: string, payload: AdjustmentPayload): Promise<InventoryModel> {
    await freshmartSdk.inventory.adjustCycleCount(productId, payload);
    return this.getInventory(productId);
  }

  async adjustReturn(productId: string, payload: AdjustmentPayload): Promise<InventoryModel> {
    await freshmartSdk.inventory.adjustReturn(productId, payload);
    return this.getInventory(productId);
  }

  async approveAdjustment(productId: string, movementId: string, remarks?: string): Promise<InventoryModel> {
    await freshmartSdk.inventory.approveAdjustment(productId, movementId, remarks);
    return this.getInventory(productId);
  }

  async rejectAdjustment(productId: string, movementId: string, remarks?: string): Promise<InventoryModel> {
    await freshmartSdk.inventory.rejectAdjustment(productId, movementId, remarks);
    return this.getInventory(productId);
  }
}

export const inventoryService = new InventoryService();
