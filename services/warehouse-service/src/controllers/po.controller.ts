import { poService } from '../services/po.service.js';
import { poReceiveSchema } from '../validators/index.js';
import { jsonResponse } from '@freshmart/platform-core';

export class PurchaseOrderController {
  async receivePurchaseOrder(poId: string, body: any) {
    const parsed = poReceiveSchema.parse(body);
    const result = await poService.receivePurchaseOrder(poId, parsed);
    return jsonResponse(200, {
      success: true,
      message: 'Purchase Order received successfully',
      data: result,
    });
  }
}

export const poController = new PurchaseOrderController();
