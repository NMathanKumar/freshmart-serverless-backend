import { inventoryService as realInventoryService } from './inventory.service';

export const inventoryService = {
  async getAll() {
    return realInventoryService.listInventory();
  }
};
