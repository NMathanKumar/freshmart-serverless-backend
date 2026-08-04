import { DomainError } from '@freshmart/platform-core';
import type { DynamoDeliveryRepository } from '../repositories/DynamoDeliveryRepository.js';
import type { Delivery, DeliveryStatus } from '../entities/Delivery.js';
import { randomUUID } from 'node:crypto';

export class DeliveryService {
  constructor(private readonly repository: DynamoDeliveryRepository) {}

  async createDelivery(data: Omit<Delivery, 'deliveryId' | 'status' | 'createdAt'>): Promise<Delivery> {
    return this.repository.save({
      deliveryId: randomUUID(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      ...data
    });
  }

  async getById(deliveryId: string): Promise<Delivery> {
    const delivery = await this.repository.getById(deliveryId);
    if (!delivery) throw new DomainError('Delivery not found', 404);
    return delivery;
  }

  async getByOrder(orderId: string): Promise<Delivery[]> {
    return this.repository.getByOrder(orderId);
  }

  async assignPartner(deliveryId: string, partnerId: string): Promise<Delivery> {
    const delivery = await this.getById(deliveryId);
    if (delivery.status !== 'PENDING') {
      throw new DomainError('Delivery must be in PENDING status to assign a partner', 409);
    }
    
    delivery.partnerId = partnerId;
    delivery.status = 'ASSIGNED';
    delivery.updatedAt = new Date().toISOString();
    
    return this.repository.save(delivery);
  }

  async updateStatus(deliveryId: string, status: DeliveryStatus): Promise<Delivery> {
    const delivery = await this.getById(deliveryId);
    
    delivery.status = status;
    delivery.updatedAt = new Date().toISOString();
    
    return this.repository.save(delivery);
  }
}
