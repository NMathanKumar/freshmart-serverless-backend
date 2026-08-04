const Joi = require('joi');

const taxBreakdownSchema = Joi.object({
  cgst: Joi.number().min(0).optional().default(0),
  sgst: Joi.number().min(0).optional().default(0),
  igst: Joi.number().min(0).optional().default(0),
  cess: Joi.number().min(0).optional().default(0),
  tds: Joi.number().min(0).optional().default(0),
});

const invoiceItemSchema = Joi.object({
  productId: Joi.string().required(),
  sku: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  quantity: Joi.number().min(1).required(),
  unitCost: Joi.number().min(0).required(),
  taxRate: Joi.number().min(0).optional().default(0),
  discount: Joi.number().min(0).optional().default(0),
  lineTotal: Joi.number().min(0).required(),
});

const paymentTermsEnum = ['NET_7', 'NET_15', 'NET_30', 'NET_45', 'NET_60', 'DUE_ON_RECEIPT', 'ADVANCE'];

const createVendorInvoiceSchema = Joi.object({
  invoiceNumber: Joi.string().max(100).required(),
  supplierId: Joi.string().required(),
  purchaseOrderId: Joi.string().required(),
  warehouseId: Joi.string().allow('', null).optional(),
  currency: Joi.string().max(10).optional().default('INR'),
  invoiceDate: Joi.string().isoDate().required(),
  paymentTerms: Joi.string().valid(...paymentTermsEnum).required(),
  
  subtotal: Joi.number().min(0).required(),
  taxBreakdown: taxBreakdownSchema.optional(),
  taxAmount: Joi.number().min(0).required(),
  discountAmount: Joi.number().min(0).optional().default(0),
  shippingAmount: Joi.number().min(0).optional().default(0),
  otherCharges: Joi.number().min(0).optional().default(0),
  totalAmount: Joi.number().min(0).required(),

  items: Joi.array().items(invoiceItemSchema).min(1).required(),
  
  attachments: Joi.array().items(
    Joi.object({
      fileUrl: Joi.string().uri().required(),
      fileName: Joi.string().required(),
      fileType: Joi.string().required(),
      documentType: Joi.string().valid('Invoice PDF', 'GST Invoice', 'Delivery Challan', 'E-Way Bill', 'Supporting Documents', 'Other').required(),
    })
  ).optional(),
  
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

const updateVendorInvoiceSchema = Joi.object({
  invoiceNumber: Joi.string().max(100).optional(),
  supplierId: Joi.string().optional(),
  purchaseOrderId: Joi.string().optional(),
  warehouseId: Joi.string().allow('', null).optional(),
  currency: Joi.string().max(10).optional(),
  invoiceDate: Joi.string().isoDate().optional(),
  paymentTerms: Joi.string().valid(...paymentTermsEnum).optional(),
  
  subtotal: Joi.number().min(0).optional(),
  taxBreakdown: taxBreakdownSchema.optional(),
  taxAmount: Joi.number().min(0).optional(),
  discountAmount: Joi.number().min(0).optional(),
  shippingAmount: Joi.number().min(0).optional(),
  otherCharges: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).optional(),

  items: Joi.array().items(invoiceItemSchema).optional(),
  attachments: Joi.array().items(
    Joi.object({
      fileUrl: Joi.string().uri().required(),
      fileName: Joi.string().required(),
      fileType: Joi.string().required(),
      documentType: Joi.string().valid('Invoice PDF', 'GST Invoice', 'Delivery Challan', 'E-Way Bill', 'Supporting Documents', 'Other').required(),
    })
  ).optional(),
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

const submitVendorInvoiceSchema = Joi.object({});

const approveVendorInvoiceSchema = Joi.object({
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

const rejectVendorInvoiceSchema = Joi.object({
  rejectionReason: Joi.string().min(1).required(),
});

const cancelVendorInvoiceSchema = Joi.object({
  cancelReason: Joi.string().min(1).required(),
});

const recordPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string().valid('BANK_TRANSFER', 'CHEQUE', 'UPI', 'CREDIT_CARD', 'CASH').required(),
  paymentDate: Joi.string().isoDate().required(),
  referenceNumber: Joi.string().max(100).required(),
  bankName: Joi.string().max(200).allow('', null).optional(),
  remarks: Joi.string().max(1000).allow('', null).optional(),
});

module.exports = {
  createVendorInvoiceSchema,
  updateVendorInvoiceSchema,
  submitVendorInvoiceSchema,
  approveVendorInvoiceSchema,
  rejectVendorInvoiceSchema,
  cancelVendorInvoiceSchema,
  recordPaymentSchema,
};
