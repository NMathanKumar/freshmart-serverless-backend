import { purchaseOrderService as realPurchaseOrderService } from './purchase-order.service';

export const purchaseOrdersService = {
  async getAll() {
    const res = await realPurchaseOrderService.listPurchaseOrders();
    return res.items;
  }
};
