import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Category } from '../entities/index.js';

type StoredRecord = TableEntity & Category;

export interface Repository {
  list(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  save(entity: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-category') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async list(): Promise<Category[]> {
    return this.repository.queryByIndex('gsi1', 'gsi1pk', 'ENTITY#CATEGORY', 'gsi1sk');
  }

  async getById(id: string): Promise<Category | null> {
    const item = await this.repository.get(`CATEGORY#${id}`, 'METADATA');
    return item ? (item as Category) : null;
  }

  async save(entity: Category): Promise<Category> {
    await this.repository.put({
      pk: `CATEGORY#${entity.categoryId}`,
      sk: 'METADATA',
      gsi1pk: 'ENTITY#CATEGORY',
      gsi1sk: `${String(entity.sortOrder).padStart(8, '0')}#${entity.slug}`,
      gsi2pk: `PARENT#${entity.parentCategoryId ?? 'ROOT'}`,
      gsi2sk: `${String(entity.sortOrder).padStart(8, '0')}#${entity.slug}`,
      ...entity
    });
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(`CATEGORY#${id}`, 'METADATA');
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, Category>();

  async list(): Promise<Category[]> {
    return [...this.store.values()];
  }

  async getById(id: string): Promise<Category | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: Category): Promise<Category> {
    this.store.set(entity.categoryId, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
