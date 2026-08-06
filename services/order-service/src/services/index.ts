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
    
    // Existing event for backward compatibility
    await this.publisher?.publish({
      source: 'freshmart.order',
      detailType: 'freshmart.order.updated',
      detail: entity
    });

    // Domain Event envelope
    const isNewOrder = !input.orderId || input.status === 'CREATED' || input.status === 'PLACED';
    const detailType = isNewOrder ? 'OrderPlaced.v1' : 'OrderStatusUpdated.v1';
    
    await this.publisher?.publish({
      source: 'order-service',
      detailType,
      detail: {
        eventId: `evt_${Date.now()}`,
        eventVersion: '1.0',
        eventType: detailType,
        source: 'order-service',
        timestamp: now,
        correlationId: `corr_${Date.now()}`,
        orderId: entity.orderId,
        customerId: (entity as any).userId || (entity as any).customerId || 'CUSTOMER',
        customerEmail: (entity as any).email || (entity as any).customerEmail || 'customer@freshmart.com',
        customerName: (entity as any).customerName || (entity as any).userName || 'Valued Customer',
        items: (entity as any).items || [],
        total: (entity as any).totalAmount || (entity as any).total || 0,
        currency: 'INR',
        deliveryAddress: (entity as any).deliveryAddress || 'Address on file',
        estimatedDelivery: (entity as any).estimatedDelivery || '15 Mins',
        paymentMethod: (entity as any).paymentMethod || 'UPI',
        status: entity.status,
        order: entity
      }
    });

    // Publish LargeOrderPlaced.v1 if total > 5000
    if (isNewOrder && Number((entity as any).totalAmount || (entity as any).total || 0) >= 5000) {
      await this.publisher?.publish({
        source: 'order-service',
        detailType: 'LargeOrderPlaced.v1',
        detail: {
          eventId: `evt_${Date.now()}_large`,
          eventType: 'LargeOrderPlaced.v1',
          orderId: entity.orderId,
          total: (entity as any).totalAmount || (entity as any).total || 0,
          customerEmail: (entity as any).email || (entity as any).customerEmail || 'customer@freshmart.com',
        }
      });
    }

    // Publish OrderCancelled.v1 if cancelled
    if (entity.status === 'CANCELLED') {
      await this.publisher?.publish({
        source: 'order-service',
        detailType: 'OrderCancelled.v1',
        detail: {
          eventId: `evt_${Date.now()}_cancel`,
          eventType: 'OrderCancelled.v1',
          orderId: entity.orderId,
          customerEmail: (entity as any).email || (entity as any).customerEmail || 'customer@freshmart.com',
        }
      });
    }

    return entity;
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
