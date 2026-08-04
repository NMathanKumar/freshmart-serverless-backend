import { randomUUID } from 'node:crypto';
import { DomainError, EventBridgePublisher, type EventPublisher } from '@freshmart/platform-core';
import type { UpsertDto } from '../dtos/index.js';
import type { AnalyticsSnapshot } from '../entities/index.js';
import type { Repository } from '../repositories/index.js';

export class AnalyticsService {
  constructor(
    private readonly repository: Repository,
    private readonly publisher?: EventPublisher
  ) {}

  async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('Analytics snapshot not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const entity: AnalyticsSnapshot = {
      snapshotId: input.snapshotId ?? randomUUID(),
      ...input,
      createdAt: new Date().toISOString()
    };
    await this.repository.save(entity);
    return entity;
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
