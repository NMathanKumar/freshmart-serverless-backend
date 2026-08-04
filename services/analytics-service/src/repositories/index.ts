import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { AnalyticsSnapshot } from '../entities/index.js';

type StoredRecord = TableEntity & AnalyticsSnapshot;

export interface Repository {
  list(): Promise<AnalyticsSnapshot[]>;
  getById(id: string): Promise<AnalyticsSnapshot | null>;
  save(entity: AnalyticsSnapshot): Promise<AnalyticsSnapshot>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-analytics') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async list(): Promise<AnalyticsSnapshot[]> {
    return this.repository.queryByIndex('gsi1', 'gsi1pk', 'ENTITY#ANALYTICS_SNAPSHOT', 'gsi1sk', {
      scanIndexForward: false
    });
  }

  async getById(id: string): Promise<AnalyticsSnapshot | null> {
    const [item] = await this.repository.queryByIndex('gsi2', 'gsi2pk', `SNAPSHOT#${id}`, 'gsi2sk', { limit: 1 });
    return item ? (item as AnalyticsSnapshot) : null;
  }

  async save(entity: AnalyticsSnapshot): Promise<AnalyticsSnapshot> {
    await this.repository.put({
      pk: `DATE#${entity.dateKey}`,
      sk: `SNAPSHOT#${entity.snapshotId}`,
      gsi1pk: 'ENTITY#ANALYTICS_SNAPSHOT',
      gsi1sk: `${entity.dateKey}#${entity.snapshotId}`,
      gsi2pk: `SNAPSHOT#${entity.snapshotId}`,
      gsi2sk: 'METADATA',
      ...entity
    });
    return entity;
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, AnalyticsSnapshot>();

  async list(): Promise<AnalyticsSnapshot[]> {
    return [...this.store.values()];
  }

  async getById(id: string): Promise<AnalyticsSnapshot | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: AnalyticsSnapshot): Promise<AnalyticsSnapshot> {
    this.store.set(entity.snapshotId, entity);
    return entity;
  }
}
