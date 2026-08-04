import { jsonResponse } from '@freshmart/platform-core';
import { DeliveryService } from '../services/DeliveryService.js';
import { assignPartnerSchema, updateStatusSchema } from '../dtos/delivery.dto.js';

export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  async getById(id: string) {
    const res = await this.service.getById(id);
    return jsonResponse(200, res);
  }

  async getByOrder(orderId: string) {
    const res = await this.service.getByOrder(orderId);
    return jsonResponse(200, res);
  }

  async assignPartner(id: string, payload: unknown) {
    const body = assignPartnerSchema.parse(payload);
    const res = await this.service.assignPartner(id, body.partnerId);
    return jsonResponse(200, res);
  }

  async updateStatus(id: string, payload: unknown) {
    const body = updateStatusSchema.parse(payload);
    const res = await this.service.updateStatus(id, body.status);
    return jsonResponse(200, res);
  }
}
