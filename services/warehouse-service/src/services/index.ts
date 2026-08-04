import { v4 as uuidv4 } from 'uuid';
import { warehouseRepository, WarehouseEntity } from '../repositories/index.js';
import { DomainError } from '@freshmart/platform-core';

export class WarehouseService {
  async listWarehouses(limit = 100): Promise<WarehouseEntity[]> {
    const warehouses = await warehouseRepository.listWarehouses(limit);
    // Filter out deleted by default
    return warehouses.filter(w => !w.isDeleted);
  }

  async getWarehouseById(id: string): Promise<WarehouseEntity> {
    const warehouse = await warehouseRepository.getWarehouseById(id);
    if (!warehouse || warehouse.isDeleted) {
      throw new DomainError('Warehouse not found', 404);
    }
    return warehouse;
  }

  async createWarehouse(payload: any, createdBy: string): Promise<WarehouseEntity> {
    // Validate uniqueness of code
    const existing = await warehouseRepository.getWarehouseByCode(payload.warehouseCode);
    if (existing && !existing.isDeleted) {
      throw new DomainError('Warehouse code already exists', 400);
    }

    const warehouseId = uuidv4();
    const entity: WarehouseEntity = {
      warehouseId,
      warehouseCode: payload.warehouseCode.toUpperCase(),
      warehouseName: payload.warehouseName,
      address: payload.address || {},
      contactPerson: payload.contactPerson,
      contactNumber: payload.contactNumber,
      email: payload.email,
      operatingHours: payload.operatingHours,
      capacity: {
        maxStorageCapacity: payload.capacity?.maxStorageCapacity || 0,
        currentUtilization: payload.capacity?.currentUtilization || 0,
        utilizationPercentage: 0,
        storageUnit: payload.capacity?.storageUnit || 'units',
      },
      zones: payload.zones || [],
      defaultReceivingZone: payload.defaultReceivingZone,
      defaultDispatchZone: payload.defaultDispatchZone,
      status: payload.status || 'ACTIVE',
      isDeleted: false,
      integrationHooks: payload.integrationHooks || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Calculate percentage
    if (entity.capacity.maxStorageCapacity > 0) {
      entity.capacity.utilizationPercentage = Math.round((entity.capacity.currentUtilization / entity.capacity.maxStorageCapacity) * 100);
    }

    return warehouseRepository.createWarehouse(entity);
  }

  async updateWarehouse(id: string, payload: any): Promise<WarehouseEntity> {
    const existing = await this.getWarehouseById(id);

    // If code is changing, check uniqueness
    if (payload.warehouseCode && payload.warehouseCode.toUpperCase() !== existing.warehouseCode) {
      const dupe = await warehouseRepository.getWarehouseByCode(payload.warehouseCode);
      if (dupe && !dupe.isDeleted) {
        throw new DomainError('Warehouse code already exists', 400);
      }
    }

    const capacity = {
      ...existing.capacity,
      ...(payload.capacity || {})
    };

    if (capacity.maxStorageCapacity > 0) {
      capacity.utilizationPercentage = Math.round((capacity.currentUtilization / capacity.maxStorageCapacity) * 100);
    } else {
      capacity.utilizationPercentage = 0;
    }

    const updates: Partial<WarehouseEntity> = {
      ...payload,
      capacity,
    };
    if (payload.warehouseCode) {
      updates.warehouseCode = payload.warehouseCode.toUpperCase();
    }

    return warehouseRepository.updateWarehouse(id, updates);
  }

  async softDeleteWarehouse(id: string, deletedBy: string): Promise<void> {
    await this.getWarehouseById(id);
    await warehouseRepository.softDeleteWarehouse(id, deletedBy);
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CLOSED'): Promise<WarehouseEntity> {
    await this.getWarehouseById(id);
    return warehouseRepository.updateWarehouse(id, { status });
  }

  async getCapacity(id: string) {
    const w = await this.getWarehouseById(id);
    return w.capacity;
  }
}

export const warehouseService = new WarehouseService();
