import { pickingService } from '../services/picking.service.js';
import { jsonResponse, DomainError } from '@freshmart/platform-core';
import Joi from 'joi';

const generatePickListSchema = Joi.object({
  fulfillmentId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      location: Joi.string().optional()
    })
  ).min(1).required()
});

const assignPickerSchema = Joi.object({
  pickerId: Joi.string().required()
});

const confirmPickSchema = Joi.object({
  taskId: Joi.string().required(),
  pickedQty: Joi.number().integer().min(0).required()
});

export class PickingController {
  async generatePickList(body: any) {
    const { error, value } = generatePickListSchema.validate(body);
    if (error) throw new DomainError(error.details[0].message, 400);

    const result = await pickingService.generatePickList(value.fulfillmentId, value.items);
    return jsonResponse(201, {
      success: true,
      message: 'Pick list generated successfully',
      data: result
    });
  }

  async assignPicker(pickListId: string, body: any) {
    const { error, value } = assignPickerSchema.validate(body);
    if (error) throw new DomainError(error.details[0].message, 400);

    const result = await pickingService.assignPicker(pickListId, value.pickerId);
    return jsonResponse(200, {
      success: true,
      message: 'Picker assigned successfully',
      data: result
    });
  }

  async confirmPick(pickListId: string, body: any) {
    const { error, value } = confirmPickSchema.validate(body);
    if (error) throw new DomainError(error.details[0].message, 400);

    const result = await pickingService.confirmPick(pickListId, value.taskId, value.pickedQty);
    return jsonResponse(200, {
      success: true,
      message: 'Pick confirmed successfully',
      data: result
    });
  }
}

export const pickingController = new PickingController();
