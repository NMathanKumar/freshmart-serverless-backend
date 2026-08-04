import { DomainError, EventBridgePublisher, type EventPublisher } from '@freshmart/platform-core';
import type { UpsertDto } from '../dtos/index.js';
import type { Cart } from '../entities/index.js';
import type { Repository } from '../repositories/index.js';

export class CartService {
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
      throw new DomainError('Cart not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const entity: Cart = {
      ...input,
      couponCodes: input.couponCodes ?? [],
      updatedAt: new Date().toISOString()
    };
    await this.repository.save(entity);
    await this.publisher?.publish({
      source: 'freshmart.cart',
      detailType: 'freshmart.cart.updated',
      detail: entity
    });
    return entity;
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
