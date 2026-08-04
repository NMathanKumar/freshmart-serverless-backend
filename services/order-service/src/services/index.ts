import { randomUUID } from 'node:crypto';
import { DomainError, EventBridgePublisher, type EventPublisher } from '@freshmart/platform-core';
import type { UpsertDto } from '../dtos/index.js';
import type { Order } from '../entities/index.js';
import type { Repository } from '../repositories/index.js';

export class OrderService {
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
      throw new DomainError('Order not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const now = new Date().toISOString();
    const entity: Order = {
      orderId: input.orderId ?? randomUUID(),
      ...input,
      status: input.status ?? 'CREATED',
      createdAt: now,
      updatedAt: now
    };
    await this.repository.save(entity);
    await this.publisher?.publish({
      source: 'freshmart.order',
      detailType: 'freshmart.order.updated',
      detail: entity
    });
    return entity;
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
