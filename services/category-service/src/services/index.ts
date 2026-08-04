import { randomUUID } from 'node:crypto';
import { DomainError, EventBridgePublisher, type EventPublisher } from '@freshmart/platform-core';
import type { UpsertDto } from '../dtos/index.js';
import type { Category } from '../entities/index.js';
import type { Repository } from '../repositories/index.js';

export class CategoryService {
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
      throw new DomainError('Category not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto, userId?: string) {
    const now = new Date().toISOString();
    const existingEntity = input.categoryId ? await this.repository.getById(input.categoryId) : null;
    const entity: Category = {
      ...existingEntity,
      categoryId: input.categoryId ?? randomUUID(),
      ...input,
      status: input.status ?? existingEntity?.status ?? 'ACTIVE',
      productCount: input.productCount ?? existingEntity?.productCount ?? 0,
      sortOrder: input.sortOrder ?? existingEntity?.sortOrder ?? 0,
      isActive: input.isActive ?? existingEntity?.isActive ?? true,
      createdAt: existingEntity?.createdAt ?? now,
      updatedAt: now,
      createdBy: existingEntity?.createdBy ?? userId,
      updatedBy: userId ?? existingEntity?.updatedBy
    };
    await this.repository.save(entity);
    return entity;
  }

  async update(categoryId: string, input: UpsertDto, userId?: string) {
    return this.upsert({ ...input, categoryId }, userId);
  }

  async delete(categoryId: string) {
    const entity = await this.repository.getById(categoryId);
    if (!entity) {
      throw new DomainError('Category not found.', 404);
    }
    await this.repository.delete(categoryId);
    return { success: true };
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
