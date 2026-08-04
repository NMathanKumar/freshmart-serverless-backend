import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Review } from '../entities/index.js';

type StoredRecord = TableEntity & Review;

export interface Repository {
  listAll(): Promise<Review[]>;
  listApprovedByProductId(productId: string): Promise<Review[]>;
  getById(id: string): Promise<Review | null>;
  getByCustomerIdAndProductId(customerId: string, productId: string): Promise<Review | null>;
  save(entity: Review): Promise<Review>;
  delete(id: string): Promise<void>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-review') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async listAll(): Promise<Review[]> {
    return this.repository.queryByIndex('gsi3', 'gsi3pk', 'ENTITY#REVIEW');
  }

  async listApprovedByProductId(productId: string): Promise<Review[]> {
    const all = await this.repository.queryByIndex('gsi1', 'gsi1pk', `PRODUCT#${productId}`);
    return all.filter(r => r.status === 'APPROVED');
  }

  async getById(id: string): Promise<Review | null> {
    const item = await this.repository.get(`REVIEW#${id}`, 'METADATA');
    return item ? (item as Review) : null;
  }

  async getByCustomerIdAndProductId(customerId: string, productId: string): Promise<Review | null> {
    const all = await this.repository.queryByIndex('gsi2', 'gsi2pk', `CUSTOMER#${customerId}`);
    return all.find(r => r.productId === productId) ?? null;
  }

  async save(entity: Review): Promise<Review> {
    await this.repository.put({
      pk: `REVIEW#${entity.reviewId}`,
      sk: 'METADATA',
      gsi1pk: `PRODUCT#${entity.productId}`,
      gsi1sk: `CREATEDAT#${entity.createdAt}`,
      gsi2pk: `CUSTOMER#${entity.customerId}`,
      gsi2sk: `CREATEDAT#${entity.createdAt}`,
      gsi3pk: `ENTITY#REVIEW`,
      gsi3sk: `STATUS#${entity.status}#CREATEDAT#${entity.createdAt}`,
      ...entity
    });
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(`REVIEW#${id}`, 'METADATA');
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, Review>();

  async listAll(): Promise<Review[]> {
    return [...this.store.values()];
  }

  async listApprovedByProductId(productId: string): Promise<Review[]> {
    return [...this.store.values()].filter(r => r.productId === productId && r.status === 'APPROVED');
  }

  async getById(id: string): Promise<Review | null> {
    return this.store.get(id) ?? null;
  }

  async getByCustomerIdAndProductId(customerId: string, productId: string): Promise<Review | null> {
    return [...this.store.values()].find(r => r.customerId === customerId && r.productId === productId) ?? null;
  }

  async save(entity: Review): Promise<Review> {
    this.store.set(entity.reviewId, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
