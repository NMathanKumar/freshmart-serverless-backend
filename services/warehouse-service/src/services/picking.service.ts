import { adminRepository } from '../repositories/admin.repository.js';
import { DomainError } from '@freshmart/platform-core';
import { v4 as uuidv4 } from 'uuid';

export class PickingService {
  async generatePickList(fulfillmentId: string, items: any[]) {
    if (!fulfillmentId || !items || items.length === 0) {
      throw new DomainError('Fulfillment ID and items are required', 400);
    }

    const pickListId = fulfillmentId;
    const pickTasks = items.map(item => ({
      taskId: uuidv4(),
      productId: item.productId,
      quantity: item.quantity,
      pickedQuantity: 0,
      status: 'PENDING',
      location: item.location || 'UNKNOWN'
    }));

    const data = {
      fulfillmentId,
      tasks: pickTasks,
      totalItems: items.length,
      pickerId: null,
      status: 'PENDING'
    };

    const result = await adminRepository.createEntity('PICK_LIST', pickListId, data, 'PENDING');
    return result;
  }

  async assignPicker(pickListId: string, pickerId: string) {
    if (!pickerId) {
      throw new DomainError('Picker ID is required', 400);
    }

    const pickList = await adminRepository.getEntity('PICK_LIST', pickListId);
    if (!pickList) {
      throw new DomainError(`Pick list with ID ${pickListId} not found`, 404);
    }

    if (pickList.data.pickerId && pickList.data.pickerId !== pickerId) {
      throw new DomainError('Pick list is already assigned to another picker', 409);
    }

    pickList.data.pickerId = pickerId;
    pickList.data.status = 'IN_PROGRESS';

    const result = await adminRepository.saveEntity('PICK_LIST', pickListId, pickList.data, 'IN_PROGRESS');
    return result;
  }

  async confirmPick(pickListId: string, taskId: string, pickedQty: number) {
    if (pickedQty < 0) {
      throw new DomainError('Picked quantity cannot be negative', 400);
    }

    const pickList = await adminRepository.getEntity('PICK_LIST', pickListId);
    if (!pickList) {
      throw new DomainError(`Pick list with ID ${pickListId} not found`, 404);
    }

    const task = pickList.data.tasks.find((t: any) => t.taskId === taskId);
    if (!task) {
      throw new DomainError(`Task with ID ${taskId} not found in pick list`, 404);
    }

    if (task.status === 'COMPLETED') {
      throw new DomainError('Task is already completed', 409);
    }

    task.pickedQuantity += pickedQty;
    
    if (task.pickedQuantity >= task.quantity) {
      task.status = 'COMPLETED';
      task.pickedQuantity = task.quantity; // Cap at required qty
    } else {
      task.status = 'PARTIAL';
    }

    const allCompleted = pickList.data.tasks.every((t: any) => t.status === 'COMPLETED');
    if (allCompleted) {
      pickList.data.status = 'COMPLETED';
    }

    const result = await adminRepository.saveEntity(
      'PICK_LIST', 
      pickListId, 
      pickList.data, 
      pickList.data.status
    );

    return result;
  }
}

export const pickingService = new PickingService();
