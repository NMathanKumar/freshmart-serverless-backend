import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { InventorySnapshot } from '../entities/index.js';

type StoredRecord = TableEntity & InventorySnapshot;

export interface Repository {
  list(): Promise<InventorySnapshot[]>;
  getById(id: string): Promise<InventorySnapshot | null>;
  save(entity: InventorySnapshot): Promise<InventorySnapshot>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-inventory') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async list(): Promise<InventorySnapshot[]> {
    return this.repository.queryByIndex('gsi3', 'gsi3pk', 'ENTITY#INVENTORY', 'gsi3sk');
  }

  async getById(id: string): Promise<InventorySnapshot | null> {
    const [item] = await this.repository.queryByIndex('gsi1', 'gsi1pk', `SKU#${id}`, 'gsi1sk', { limit: 1 });
    return item ? (item as InventorySnapshot) : null;
  }

  async save(entity: InventorySnapshot): Promise<InventorySnapshot> {
    await this.repository.put({
      pk: `WAREHOUSE#${entity.warehouse}`,
      sk: `SKU#${entity.sku}`,
      gsi1pk: `SKU#${entity.sku}`,
      gsi1sk: `WAREHOUSE#${entity.warehouse}`,
      gsi2pk: entity.availableStock <= entity.restockThreshold ? 'LOW_STOCK' : 'STOCK_OK',
      gsi2sk: `${String(entity.availableStock).padStart(8, '0')}#${entity.sku}`,
      gsi3pk: 'ENTITY#INVENTORY',
      gsi3sk: `${entity.warehouse}#${entity.sku}`,
      ...entity
    });
    return entity;
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, InventorySnapshot>();

  async list(): Promise<InventorySnapshot[]> {
    return [...this.store.values()];
  }

  async getById(id: string): Promise<InventorySnapshot | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: InventorySnapshot): Promise<InventorySnapshot> {
    this.store.set(entity.sku, entity);
    return entity;
  }
}
