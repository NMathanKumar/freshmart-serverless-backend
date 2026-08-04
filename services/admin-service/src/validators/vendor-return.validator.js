const Joi = require('joi');

const reasonCodeEnum = ['DEFECTIVE', 'DAMAGED', 'WRONG_ITEM', 'QUALITY_ISSUE', 'EXPIRED', 'EXCESS_SUPPLY', 'OTHER'];

const returnItemSchema = Joi.object({
  productId: Joi.string().required(),
  sku: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  quantityReturned: Joi.number().integer().positive().required(),
  unitCost: Joi.number().min(0).required(),
  reason: Joi.string().allow('', null).optional(),
  lineTotal: Joi.number().min(0).required(),
});

const createReturnSchema = Joi.object({
  supplierId: Joi.string().required(),
  purchaseOrderId: Joi.string().required(),
  warehouseId: Joi.string().allow('', null).optional(),
  reasonCode: Joi.string().valid(...reasonCodeEnum).required(),
  
  items: Joi.array().items(returnItemSchema).min(1).required(),
  
  attachments: Joi.array().items(
    Joi.object({
      fileUrl: Joi.string().uri().required(),
      fileName: Joi.string().required(),
      fileType: Joi.string().required(),
      documentType: Joi.string().required(),
    })
  ).optional(),
  
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

const updateReturnSchema = Joi.object({
  supplierId: Joi.string().optional(),
  purchaseOrderId: Joi.string().optional(),
  warehouseId: Joi.string().allow('', null).optional(),
  reasonCode: Joi.string().valid(...reasonCodeEnum).optional(),
  
  items: Joi.array().items(returnItemSchema).min(1).optional(),
  
  attachments: Joi.array().items(
    Joi.object({
      fileUrl: Joi.string().uri().required(),
      fileName: Joi.string().required(),
      fileType: Joi.string().required(),
      documentType: Joi.string().required(),
    })
  ).optional(),
  
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

const submitReturnSchema = Joi.object({});

const approveReturnSchema = Joi.object({
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

const rejectReturnSchema = Joi.object({
  rejectionReason: Joi.string().min(1).required(),
});

const dispatchReturnSchema = Joi.object({
  dispatchDate: Joi.string().isoDate().required(),
  carrier: Joi.string().max(200).allow('', null).optional(),
  trackingNumber: Joi.string().max(100).allow('', null).optional(),
  vehicleNumber: Joi.string().max(50).allow('', null).optional(),
  dispatchedBy: Joi.string().max(100).allow('', null).optional(),
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

const vendorReceivedSchema = Joi.object({
  receivedDate: Joi.string().isoDate().required(),
  receivedBy: Joi.string().max(100).allow('', null).optional(),
  remarks: Joi.string().max(1000).allow('', null).optional(),
  qualityInspection: Joi.object({
    status: Joi.string().valid('PASSED', 'FAILED', 'PARTIAL').required(),
    remarks: Joi.string().max(1000).allow('', null).optional(),
    inspector: Joi.string().max(100).allow('', null).optional(),
    inspectionDate: Joi.string().isoDate().optional(),
  }).optional(),
});

const creditNoteSchema = Joi.object({
  creditNoteNumber: Joi.string().max(100).required(),
  creditNoteDate: Joi.string().isoDate().required(),
  creditNoteAmount: Joi.number().positive().required(),
  invoiceId: Joi.string().required(),
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

const cancelReturnSchema = Joi.object({
  cancelReason: Joi.string().min(1).required(),
});

module.exports = {
  createReturnSchema,
  updateReturnSchema,
  submitReturnSchema,
  approveReturnSchema,
  rejectReturnSchema,
  dispatchReturnSchema,
  vendorReceivedSchema,
  creditNoteSchema,
  cancelReturnSchema,
};
