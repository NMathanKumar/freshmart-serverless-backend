const { z } = require('zod');

const TransferItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  sku: z.string().optional(),
  batchNumber: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  unitCost: z.number().min(0).optional(),
  lineTotal: z.number().min(0).optional(),
  requestedQty: z.number().int().min(1, 'Requested quantity must be at least 1'),
  reservedQty: z.number().int().min(0).optional().default(0),
  dispatchedQty: z.number().int().min(0).optional().default(0),
  receivedQty: z.number().int().min(0).optional().default(0),
  remainingQty: z.number().int().min(0).optional(),
});

const CreateTransferSchema = z.object({
  sourceWarehouseId: z.string().min(1, 'Source Warehouse ID is required'),
  destinationWarehouseId: z.string().min(1, 'Destination Warehouse ID is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  expectedDispatchDate: z.string().optional().nullable(),
  expectedArrivalDate: z.string().optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
  items: z.array(TransferItemSchema).min(1, 'At least one item is required'),
}).refine(data => data.sourceWarehouseId !== data.destinationWarehouseId, {
  message: "Source and destination warehouses cannot be the same",
  path: ["destinationWarehouseId"],
}).refine(data => {
  const productIds = data.items.map(i => i.productId);
  return new Set(productIds).size === productIds.length;
}, {
  message: "Duplicate product IDs are not allowed in transfer items",
  path: ["items"],
});

const UpdateTransferSchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  expectedDispatchDate: z.string().optional().nullable(),
  expectedArrivalDate: z.string().optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
  items: z.array(TransferItemSchema).optional(),
}).refine(data => {
  if (!data.items) return true;
  const productIds = data.items.map(i => i.productId);
  return new Set(productIds).size === productIds.length;
}, {
  message: "Duplicate product IDs are not allowed in transfer items",
  path: ["items"],
});

const SubmitTransferSchema = z.object({});

const ApproveTransferSchema = z.object({});

const RejectTransferSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

const CancelTransferSchema = z.object({
  cancelReason: z.string().min(1, 'Cancel reason is required'),
});

const DispatchTransferSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    dispatchedQty: z.number().int().min(0),
  })).min(1, 'Dispatch items required'),
  vehicleNumber: z.string().optional().nullable(),
  driverName: z.string().optional().nullable(),
  driverPhone: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  dispatchRemarks: z.string().optional().nullable(),
}).refine(data => {
  const productIds = data.items.map(i => i.productId);
  return new Set(productIds).size === productIds.length;
}, {
  message: "Duplicate product IDs are not allowed in dispatch items",
  path: ["items"],
});

const ReceiveTransferSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    receivedQty: z.number().int().min(0),
  })).min(1, 'Receive items required'),
  receivingRemarks: z.string().optional().nullable(),
}).refine(data => {
  const productIds = data.items.map(i => i.productId);
  return new Set(productIds).size === productIds.length;
}, {
  message: "Duplicate product IDs are not allowed in receive items",
  path: ["items"],
});

module.exports = {
  CreateTransferSchema,
  UpdateTransferSchema,
  SubmitTransferSchema,
  ApproveTransferSchema,
  RejectTransferSchema,
  CancelTransferSchema,
  DispatchTransferSchema,
  ReceiveTransferSchema,
};
