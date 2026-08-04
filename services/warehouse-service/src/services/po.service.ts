import { adminRepository } from '../repositories/admin.repository.js';
import { DomainError, EventBridgePublisher } from '@freshmart/platform-core';
import { v4 as uuidv4 } from 'uuid';

export class PurchaseOrderService {
  private readonly eventPublisher = process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;

  async receivePurchaseOrder(poId: string, payload: any) {
    let po = await adminRepository.getEntity('PURCHASE_ORDER', poId);
    
    // If PO is not found locally, create one or assume it's passed in
    if (!po) {
      po = await adminRepository.createEntity('PURCHASE_ORDER', poId, { items: payload.items }, 'SUBMITTED');
    }

    if (po.status === 'RECEIVED') {
      throw new DomainError('Purchase Order is already received', 400);
    }

    const grnId = uuidv4();
    const grnData = {
      poId,
      receivedItems: payload.items,
      notes: payload.notes,
      receivedAt: new Date().toISOString()
    };

    // Save GRN
    await adminRepository.createEntity('GRN', grnId, grnData, 'COMPLETED');

    // Update PO Status
    await adminRepository.saveEntity('PURCHASE_ORDER', poId, po.data, 'RECEIVED');

    // Publish event for inventory service to increment stock
    if (this.eventPublisher) {
      await this.eventPublisher.publish({
        source: 'freshmart.warehouse',
        detailType: 'PurchaseOrderReceived.v1',
        detail: {
          poId,
          grnId,
          items: payload.items,
          reason: 'PURCHASE_ORDER_RECEIPT'
        }
      });
    }

    return { grnId, poId, status: 'RECEIVED' };
  }
}

export const poService = new PurchaseOrderService();
