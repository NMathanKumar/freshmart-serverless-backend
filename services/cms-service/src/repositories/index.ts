import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { CmsPage } from '../entities/index.js';

type StoredRecord = TableEntity & CmsPage;

export interface Repository {
  list(): Promise<CmsPage[]>;
  getById(id: string): Promise<CmsPage | null>;
  save(entity: CmsPage): Promise<CmsPage>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-cms') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async list(): Promise<CmsPage[]> {
    return this.repository.queryByIndex('gsi3', 'gsi3pk', 'ENTITY#CMS_PAGE', 'gsi3sk', {
      scanIndexForward: false
    });
  }

  async getById(id: string): Promise<CmsPage | null> {
    const item = await this.repository.get(`PAGE#${id}`, 'METADATA');
    return item ? (item as CmsPage) : null;
  }

  async save(entity: CmsPage): Promise<CmsPage> {
    await this.repository.put({
      pk: `PAGE#${entity.pageId}`,
      sk: 'METADATA',
      gsi1pk: `SLUG#${entity.slug}`,
      gsi1sk: 'METADATA',
      gsi2pk: `TYPE#${entity.type}`,
      gsi2sk: `${entity.isPublished ? 'PUBLISHED' : 'DRAFT'}#${entity.slug}`,
      gsi3pk: 'ENTITY#CMS_PAGE',
      gsi3sk: `${entity.updatedAt}#${entity.pageId}`,
      ...entity
    });
    return entity;
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, CmsPage>();

  async list(): Promise<CmsPage[]> {
    return [...this.store.values()];
  }

  async getById(id: string): Promise<CmsPage | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: CmsPage): Promise<CmsPage> {
    this.store.set(entity.pageId, entity);
    return entity;
  }
}
