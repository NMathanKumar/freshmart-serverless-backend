import { warehouseService } from '../services/index.js';
import { warehouseSchema, warehouseStatusSchema } from '../validators/index.js';
import { jsonResponse } from '@freshmart/platform-core';
export class WarehouseController {
  async listWarehouses(limitStr?: string) {
    const limit = parseInt(limitStr || '100') || 100;
    const warehouses = await warehouseService.listWarehouses(limit);
    return jsonResponse(200, {
      success: true,
      message: 'Warehouses retrieved successfully',
      data: warehouses,
    });
  }

  async getWarehouseById(id: string) {
    const warehouse = await warehouseService.getWarehouseById(id);
    return jsonResponse(200, {
      success: true,
      message: 'Warehouse retrieved successfully',
      data: warehouse,
    });
  }

  async createWarehouse(body: any, createdBy: string) {
    const parsed = warehouseSchema.parse(body);
    const warehouse = await warehouseService.createWarehouse(parsed, createdBy);
    return jsonResponse(201, {
      success: true,
      message: 'Warehouse created successfully',
      data: warehouse,
    });
  }

  async updateWarehouse(id: string, body: any) {
    const parsed = warehouseSchema.partial().parse(body);
    const warehouse = await warehouseService.updateWarehouse(id, parsed);
    return jsonResponse(200, {
      success: true,
      message: 'Warehouse updated successfully',
      data: warehouse,
    });
  }

  async updateWarehouseStatus(id: string, body: any) {
    const { status } = warehouseStatusSchema.parse(body);
    const warehouse = await warehouseService.updateStatus(id, status);
    return jsonResponse(200, {
      success: true,
      message: 'Warehouse status updated successfully',
      data: warehouse,
    });
  }

  async softDeleteWarehouse(id: string, deletedBy: string) {
    await warehouseService.softDeleteWarehouse(id, deletedBy);
    return jsonResponse(200, {
      success: true,
      message: 'Warehouse deleted successfully',
    });
  }

  async getCapacity(id: string) {
    const capacity = await warehouseService.getCapacity(id);
    return jsonResponse(200, {
      success: true,
      message: 'Warehouse capacity retrieved successfully',
      data: capacity,
    });
  }
}

export const warehouseController = new WarehouseController();
