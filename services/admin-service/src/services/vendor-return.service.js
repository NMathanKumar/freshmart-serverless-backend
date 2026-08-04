const vendorReturnRepo = require('../repositories/vendor-return.repository');
const adminRepo = require('../repositories/admin.repository');
const vendorInvoiceRepo = require('../repositories/vendor-invoice.repository');
const { errors } = require('@freshmart/service-shared');

const getReturnOrThrow = async (id) => {
  const rtv = await vendorReturnRepo.getReturn(id);
  if (!rtv) throw new errors.NotFoundError(`Vendor Return ${id} not found`);
  return rtv;
};

const getPurchaseOrderOrThrow = async (id) => {
  const po = await adminRepo.getEntity('PURCHASE_ORDER', id);
  if (!po) throw new errors.NotFoundError(`Purchase Order ${id} not found`);
  return po;
};

const getSupplierOrThrow = async (id) => {
  const supplier = await adminRepo.getEntity('SUPPLIER', id);
  if (!supplier) throw new errors.NotFoundError(`Supplier ${id} not found`);
  return supplier;
};

const { publishAdminEvent } = require('../events/publisher');

const publishEvent = (eventName, payload) => {
  return publishAdminEvent(eventName, payload).catch(err => {
    require('@freshmart/service-shared').logger.error(`Failed to publish ${eventName}`, err);
  });
};

const createReturn = async (data, context = {}) => {
  await getSupplierOrThrow(data.supplierId);
  const po = await getPurchaseOrderOrThrow(data.purchaseOrderId);

  if (po.status !== 'RECEIVED' && po.status !== 'PARTIALLY_RECEIVED') {
    throw new errors.ConflictError(`Cannot create return for PO in status ${po.status}. Must be RECEIVED or PARTIALLY_RECEIVED.`);
  }

  const receivedMap = {};
  (po.data.items || []).forEach(item => {
    receivedMap[item.productId] = {
      receivedQuantity: item.quantityReceived || 0,
    };
  });

  for (const item of data.items) {
    const poItem = receivedMap[item.productId];
    if (!poItem) {
      throw new errors.ConflictError(`Return contains product ${item.productId} not found in PO.`);
    }
    if (item.quantityReturned > poItem.receivedQuantity) {
      throw new errors.ConflictError(`Return quantity (${item.quantityReturned}) exceeds received quantity (${poItem.receivedQuantity}) for product ${item.productId}.`);
    }
  }

  const sequence = await adminRepo.getNextSequence('RTV');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const returnNumber = `RTV-${dateStr}-${String(sequence).padStart(6, '0')}`;

  const now = new Date().toISOString();
  
  const returnData = {
    ...data,
    returnNumber,
    creditNoteHistory: [],
    statusHistory: [
      { status: 'DRAFT', action: 'Created', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: 'Return created' }
    ]
  };

  const rtv = await vendorReturnRepo.createReturn(returnData, context);
  publishEvent('RTVCreated', rtv);
  return rtv;
};

const updateReturn = async (id, data, context = {}) => {
  const current = await getReturnOrThrow(id);
  if (current.status !== 'DRAFT') {
    throw new errors.ConflictError(`Cannot update return in status ${current.status}`);
  }

  const updatedData = {
    ...current.data,
    ...data,
    statusHistory: [
      ...(current.data.statusHistory || []),
      { status: 'DRAFT', action: 'Updated', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: 'Return updated' }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'DRAFT', current.version, context);
  return updated;
};

const submitReturn = async (id, context = {}) => {
  const rtv = await getReturnOrThrow(id);
  if (rtv.status !== 'DRAFT') {
    throw new errors.ConflictError(`Cannot submit return in status ${rtv.status}`);
  }

  const updatedData = {
    ...rtv.data,
    statusHistory: [
      ...(rtv.data.statusHistory || []),
      { status: 'REQUESTED', action: 'Submitted', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: 'Return submitted for approval' }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'REQUESTED', rtv.version, context);
  publishEvent('RTVSubmitted', updated);
  return updated;
};

const approveReturn = async (id, payload, context = {}) => {
  const rtv = await getReturnOrThrow(id);
  if (rtv.status !== 'REQUESTED') {
    throw new errors.ConflictError(`Cannot approve return in status ${rtv.status}`);
  }

  const now = new Date().toISOString();
  const updatedData = {
    ...rtv.data,
    approvedBy: context.userId || 'SYSTEM',
    approvedAt: now,
    statusHistory: [
      ...(rtv.data.statusHistory || []),
      { status: 'APPROVED', action: 'Approved', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: payload.remarks || 'Approved' }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'APPROVED', rtv.version, context);
  publishEvent('RTVApproved', updated);
  return updated;
};

const rejectReturn = async (id, payload, context = {}) => {
  const rtv = await getReturnOrThrow(id);
  if (rtv.status !== 'REQUESTED') {
    throw new errors.ConflictError(`Cannot reject return in status ${rtv.status}`);
  }

  const updatedData = {
    ...rtv.data,
    statusHistory: [
      ...(rtv.data.statusHistory || []),
      { status: 'REJECTED', action: 'Rejected', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: payload.rejectionReason }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'REJECTED', rtv.version, context);
  publishEvent('RTVRejected', updated);
  return updated;
};

const dispatchReturn = async (id, payload, context = {}) => {
  const rtv = await getReturnOrThrow(id);
  if (rtv.status !== 'APPROVED') {
    throw new errors.ConflictError(`Cannot dispatch return in status ${rtv.status}`);
  }

  const baseUrl = process.env.INVENTORY_SERVICE_URL || process.env.MENU_SERVICE_URL || '';
  const token = process.env.INTERNAL_SERVICE_TOKEN || '';

  // Deduct stock for each item
  for (const item of rtv.data.items) {
    const adjustPayload = {
      amount: -item.quantityReturned,
      reason: 'RETURN_TO_VENDOR',
      movementType: 'RETURN_TO_VENDOR',
      referenceType: 'RTV',
      referenceId: id,
      warehouseId: rtv.data.warehouseId || null,
      remarks: payload.remarks || ''
    };

    const response = await fetch(`${baseUrl}/v1/inventory/${item.productId}/adjustment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-service-token': token
      },
      body: JSON.stringify(adjustPayload)
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Inventory deduction failed for product ${item.productId}: ${errorMsg}`);
    }
  }

  const now = new Date().toISOString();
  const updatedData = {
    ...rtv.data,
    dispatchHistory: [
      ...(rtv.data.dispatchHistory || []),
      { ...payload, dispatchedAt: now }
    ],
    statusHistory: [
      ...(rtv.data.statusHistory || []),
      { status: 'DISPATCHED', action: 'Dispatched', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: payload.remarks || 'Items dispatched to vendor' }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'DISPATCHED', rtv.version, context);
  publishEvent('RTVDispatched', updated);
  return updated;
};

const vendorReceived = async (id, payload, context = {}) => {
  const rtv = await getReturnOrThrow(id);
  if (rtv.status !== 'DISPATCHED') {
    throw new errors.ConflictError(`Cannot mark as received in status ${rtv.status}`);
  }

  const now = new Date().toISOString();
  const updatedData = {
    ...rtv.data,
    vendorReceipt: {
      receivedDate: payload.receivedDate,
      receivedBy: payload.receivedBy,
      remarks: payload.remarks,
      qualityInspection: payload.qualityInspection
    },
    statusHistory: [
      ...(rtv.data.statusHistory || []),
      { status: 'RECEIVED_BY_VENDOR', action: 'Vendor Received', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: payload.remarks || 'Received by vendor' }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'RECEIVED_BY_VENDOR', rtv.version, context);
  publishEvent('RTVReceivedByVendor', updated);
  return updated;
};

const recordCreditNote = async (id, payload, context = {}) => {
  const rtv = await getReturnOrThrow(id);
  if (rtv.status !== 'RECEIVED_BY_VENDOR') {
    throw new errors.ConflictError(`Cannot record credit note in status ${rtv.status}`);
  }

  const invoice = await vendorInvoiceRepo.getInvoice(payload.invoiceId);
  if (!invoice) {
    throw new errors.NotFoundError(`Vendor Invoice ${payload.invoiceId} not found`);
  }

  const creditAmount = Number(payload.creditNoteAmount);
  const currentAdjusted = Number(invoice.data.adjustedAmount || 0);
  const totalAmount = Number(invoice.data.totalAmount || 0);
  const paidAmount = Number(invoice.data.paidAmount || 0);

  const maxAdjustmentAllowed = totalAmount - paidAmount - currentAdjusted;
  if (creditAmount > maxAdjustmentAllowed) {
    throw new errors.ConflictError(`Credit note amount (${creditAmount}) exceeds max allowed adjustment (${maxAdjustmentAllowed}) for invoice ${payload.invoiceId}`);
  }

  // Update Invoice
  const newAdjustedAmount = currentAdjusted + creditAmount;
  const newCreditNoteAmount = Number(invoice.data.creditNoteAmount || 0) + creditAmount;
  const newBalanceAmount = totalAmount - paidAmount - newAdjustedAmount;
  
  let newPaymentStatus = invoice.data.paymentStatus;
  let newInvoiceStatus = invoice.status;
  
  if (newBalanceAmount <= 0) {
    newPaymentStatus = newBalanceAmount < 0 ? 'OVERPAID' : 'PAID';
    newInvoiceStatus = 'PAID';
  }

  const invoiceUpdatedData = {
    ...invoice.data,
    adjustedAmount: newAdjustedAmount,
    creditNoteAmount: newCreditNoteAmount,
    balanceAmount: newBalanceAmount,
    paymentStatus: newPaymentStatus,
    statusHistory: [
      ...(invoice.data.statusHistory || []),
      { status: newInvoiceStatus, action: 'Credit Note Applied', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: `Applied credit note from RTV ${id}` }
    ]
  };

  await vendorInvoiceRepo.saveInvoice(payload.invoiceId, invoiceUpdatedData, newInvoiceStatus, invoice.version, context);

  // Update RTV
  const now = new Date().toISOString();
  const creditNoteEntry = {
    creditNoteNumber: payload.creditNoteNumber,
    creditNoteDate: payload.creditNoteDate,
    creditNoteAmount: creditAmount,
    invoiceId: payload.invoiceId,
    remarks: payload.remarks,
    recordedAt: now,
    recordedBy: context.userId || 'SYSTEM'
  };

  const updatedData = {
    ...rtv.data,
    creditNoteHistory: [
      ...(rtv.data.creditNoteHistory || []),
      creditNoteEntry
    ],
    statusHistory: [
      ...(rtv.data.statusHistory || []),
      { status: 'CREDIT_NOTE_RECEIVED', action: 'Credit Note Recorded', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: `Credit note ${payload.creditNoteNumber} applied` }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'CREDIT_NOTE_RECEIVED', rtv.version, context);
  publishEvent('RTVCreditNoteRecorded', updated);
  return updated;
};

const closeReturn = async (id, context = {}) => {
  const rtv = await getReturnOrThrow(id);
  if (rtv.status !== 'CREDIT_NOTE_RECEIVED') {
    throw new errors.ConflictError(`Cannot close return in status ${rtv.status}`);
  }

  const updatedData = {
    ...rtv.data,
    statusHistory: [
      ...(rtv.data.statusHistory || []),
      { status: 'CLOSED', action: 'Closed', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: 'Return lifecycle completed' }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'CLOSED', rtv.version, context);
  publishEvent('RTVClosed', updated);
  return updated;
};

const cancelReturn = async (id, payload, context = {}) => {
  const rtv = await getReturnOrThrow(id);
  if (rtv.status !== 'DRAFT' && rtv.status !== 'REQUESTED') {
    throw new errors.ConflictError(`Cannot cancel return in status ${rtv.status}`);
  }

  const updatedData = {
    ...rtv.data,
    statusHistory: [
      ...(rtv.data.statusHistory || []),
      { status: 'CANCELLED', action: 'Cancelled', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: payload.cancelReason }
    ]
  };

  const updated = await vendorReturnRepo.saveReturn(id, updatedData, 'CANCELLED', rtv.version, context);
  publishEvent('RTVCancelled', updated);
  return updated;
};

module.exports = {
  createReturn,
  updateReturn,
  submitReturn,
  approveReturn,
  rejectReturn,
  dispatchReturn,
  vendorReceived,
  recordCreditNote,
  closeReturn,
  cancelReturn,
};
