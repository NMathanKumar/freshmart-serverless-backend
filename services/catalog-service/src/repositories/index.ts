import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { CatalogProduct } from '../entities/index.js';

type StoredRecord = TableEntity & CatalogProduct;

export interface Repository {
  list(): Promise<CatalogProduct[]>;
  getById(id: string): Promise<CatalogProduct | null>;
  save(entity: CatalogProduct): Promise<CatalogProduct>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-catalog') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async list(): Promise<CatalogProduct[]> {
    return this.repository.queryByIndex('gsi1', 'gsi1pk', 'ENTITY#PRODUCT', 'gsi1sk', {
      scanIndexForward: false
    });
  }

  async getById(id: string): Promise<CatalogProduct | null> {
    const item = await this.repository.get(`PRODUCT#${id}`, 'METADATA');
    return item ? (item as CatalogProduct) : null;
  }

  async save(entity: CatalogProduct): Promise<CatalogProduct> {
    await this.repository.put({
      pk: `PRODUCT#${entity.productId}`,
      sk: 'METADATA',
      gsi1pk: 'ENTITY#PRODUCT',
      gsi1sk: `${entity.updatedAt}#${entity.productId}`,
      gsi2pk: `CATEGORY#${entity.categoryId}`,
      gsi2sk: `${entity.slug}#${entity.productId}`,
      gsi3pk: `BRAND#${entity.brand.toLowerCase()}`,
      gsi3sk: `${entity.slug}#${entity.productId}`,
      ...entity
    });
    return entity;
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, CatalogProduct>();

  async list(): Promise<CatalogProduct[]> {
    return [...this.store.values()];
  }

  async getById(id: string): Promise<CatalogProduct | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: CatalogProduct): Promise<CatalogProduct> {
    this.store.set(entity.productId, entity);
    return entity;
  }
}
