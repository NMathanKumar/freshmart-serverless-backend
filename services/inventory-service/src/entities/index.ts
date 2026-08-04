export interface InventorySnapshot {
  sku: string;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  restockThreshold: number;
  warehouse: string;
  updatedAt: string;
}