import { packingService } from '../services/packing.service.js';
import { jsonResponse, DomainError } from '@freshmart/platform-core';
import Joi from 'joi';


const createPackageSchema = Joi.object({
  fulfillmentId: Joi.string().required(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required()
  }).required(),
  weight: Joi.number().positive().required(),
  labels: Joi.array().items(Joi.string()).optional()
});

const qualityInspectionSchema = Joi.object({
  status: Joi.string().valid('PASSED', 'FAILED').required(),
  inspectorId: Joi.string().required()
});

export class PackingController {
  async createPackage(body: any) {
    const { error, value } = createPackageSchema.validate(body);
    if (error) throw new DomainError(error.details[0].message, 400);

    const result = await packingService.createPackage(
      value.fulfillmentId,
      value.dimensions,
      value.weight,
      value.labels || []
    );
    
    return jsonResponse(201, {
      success: true,
      message: 'Package created successfully',
      data: result
    });
  }

  async qualityInspection(packageId: string, body: any) {
    const { error, value } = qualityInspectionSchema.validate(body);
    if (error) throw new DomainError(error.details[0].message, 400);

    const result = await packingService.qualityInspection(packageId, value.status, value.inspectorId);
    return jsonResponse(200, {
      success: true,
      message: 'Quality inspection completed successfully',
      data: result
    });
  }
}

export const packingController = new PackingController();
