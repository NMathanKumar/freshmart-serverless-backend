const Joi = require('joi');

const purchaseOrderIdSchema = Joi.object({
  purchaseOrderId: Joi.string().trim().min(1).max(128).required(),
});

const purchaseOrderListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow('').optional(),
  status: Joi.string().valid('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED').optional(),
  supplierId: Joi.string().trim().max(128).allow('', null).optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'totalAmount', 'orderDate', 'expectedDeliveryDate').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const poItemSchema = Joi.object({
  productId: Joi.string().trim().min(1).max(128).required(),
  sku: Joi.string().trim().max(100).allow('', null).optional(),
  productName: Joi.string().max(200).allow('', null).optional(),
  quantityOrdered: Joi.number().integer().positive().required(), // > 0
  quantityReceived: Joi.number().integer().min(0).default(0),
  unitPrice: Joi.number().min(0).required(), // >= 0
  lineTotal: Joi.number().min(0).optional(),
});

const createPurchaseOrderSchema = Joi.object({
  supplierId: Joi.string().trim().min(1).max(128).required(),
  supplierName: Joi.string().max(200).allow('', null).optional(),
  warehouseId: Joi.string().trim().max(128).allow('', null).optional(),
  orderDate: Joi.string().isoDate().allow(null).optional(),
  expectedDeliveryDate: Joi.string().isoDate().allow(null).optional(),
  currency: Joi.string().trim().max(10).default('USD'),
  subtotal: Joi.number().min(0).optional(),
  tax: Joi.number().min(0).default(0),
  shippingCost: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  totalAmount: Joi.number().min(0).optional(),
  paymentTerms: Joi.string().max(200).allow('', null).optional(),
  items: Joi.array().items(poItemSchema).min(1).required(),
  notes: Joi.string().max(1000).allow('', null).optional(),
});

const updatePurchaseOrderSchema = Joi.object({
  supplierId: Joi.string().trim().min(1).max(128).optional(),
  supplierName: Joi.string().max(200).allow('', null).optional(),
  warehouseId: Joi.string().trim().max(128).allow('', null).optional(),
  orderDate: Joi.string().isoDate().allow(null).optional(),
  expectedDeliveryDate: Joi.string().isoDate().allow(null).optional(),
  currency: Joi.string().trim().max(10).optional(),
  subtotal: Joi.number().min(0).optional(),
  tax: Joi.number().min(0).optional(),
  shippingCost: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).optional(),
  paymentTerms: Joi.string().max(200).allow('', null).optional(),
  items: Joi.array().items(poItemSchema).min(1).optional(),
  notes: Joi.string().max(1000).allow('', null).optional(),
}).min(1);

const receivePurchaseOrderSchema = Joi.object({
  warehouseId: Joi.string().trim().min(1).max(128).required(),
  receivedItems: Joi.array().items(
    Joi.object({
      productId: Joi.string().trim().min(1).max(128).required(),
      receivedQuantity: Joi.number().integer().min(0).required(),
    })
  ).min(1).required(),
  notes: Joi.string().max(1000).allow('', null).optional(),
});

const approvePurchaseOrderSchema = Joi.object({
  notes: Joi.string().max(1000).allow('', null).optional(),
});

const rejectPurchaseOrderSchema = Joi.object({
  reason: Joi.string().max(1000).required(),
});

const autoGenerateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().trim().min(1).max(128).required(),
      supplierId: Joi.string().trim().min(1).max(128).required(),
      warehouseId: Joi.string().trim().min(1).max(128).required(),
      recommendedQty: Joi.number().integer().positive().required(),
      unitCost: Joi.number().min(0).required(),
    })
  ).min(1).required(),
});

module.exports = {
  purchaseOrderIdSchema,
  purchaseOrderListSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  receivePurchaseOrderSchema,
  approvePurchaseOrderSchema,
  rejectPurchaseOrderSchema,
  autoGenerateSchema,
};
