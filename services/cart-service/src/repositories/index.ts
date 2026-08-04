import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Cart } from '../entities/index.js';

type StoredRecord = TableEntity & Cart;

export interface Repository {
  list(): Promise<Cart[]>;
  getById(id: string): Promise<Cart | null>;
  save(entity: Cart): Promise<Cart>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-cart') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async list(): Promise<Cart[]> {
    return this.repository.queryByIndex('gsi1', 'gsi1pk', 'ENTITY#CART', 'gsi1sk', {
      scanIndexForward: false
    });
  }

  async getById(id: string): Promise<Cart | null> {
    const item = await this.repository.get(`CUSTOMER#${id}`, 'ACTIVE');
    return item ? (item as Cart) : null;
  }

  async save(entity: Cart): Promise<Cart> {
    await this.repository.put({
      pk: `CUSTOMER#${entity.customerId}`,
      sk: 'ACTIVE',
      gsi1pk: 'ENTITY#CART',
      gsi1sk: `${entity.updatedAt}#${entity.customerId}`,
      ...entity
    });
    return entity;
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, Cart>();

  async list(): Promise<Cart[]> {
    return [...this.store.values()];
  }

  async getById(id: string): Promise<Cart | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: Cart): Promise<Cart> {
    this.store.set(entity.customerId, entity);
    return entity;
  }
}
