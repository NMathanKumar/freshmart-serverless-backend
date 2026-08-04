const { randomUUID } = require('crypto');
const vendorInvoiceRepo = require('../repositories/vendor-invoice.repository');
const adminRepo = require('../repositories/admin.repository');
const { errors } = require('@freshmart/service-shared');

const getInvoiceOrThrow = async (id) => {
  const invoice = await vendorInvoiceRepo.getInvoice(id);
  if (!invoice) throw new errors.NotFoundError(`Invoice ${id} not found`);
  return invoice;
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

const calculateDueDate = (invoiceDateStr, paymentTerms) => {
  const invoiceDate = new Date(invoiceDateStr);
  let daysToAdd = 0;
  
  switch (paymentTerms) {
    case 'NET_7': daysToAdd = 7; break;
    case 'NET_15': daysToAdd = 15; break;
    case 'NET_30': daysToAdd = 30; break;
    case 'NET_45': daysToAdd = 45; break;
    case 'NET_60': daysToAdd = 60; break;
    case 'DUE_ON_RECEIPT': daysToAdd = 0; break;
    case 'ADVANCE': daysToAdd = 0; break;
    default: daysToAdd = 0;
  }
  
  invoiceDate.setDate(invoiceDate.getDate() + daysToAdd);
  return invoiceDate.toISOString();
};

const check3WayMatch = (invoice, po) => {
  if (po.status !== 'APPROVED' && po.status !== 'PARTIALLY_RECEIVED' && po.status !== 'RECEIVED' && po.status !== 'COMPLETED') {
    throw new errors.ConflictError(`PO ${po.adminItemId} must be approved and received before invoicing. Current Status: ${po.status}`);
  }
  
  const receiptHistory = po.data.receiptHistory || [];
  if (receiptHistory.length === 0) {
    throw new errors.ConflictError(`PO ${po.adminItemId} has no goods receipt (GRN) records.`);
  }

  // Calculate total received quantities
  const receivedMap = {};
  po.data.items.forEach(item => {
    receivedMap[item.productId] = {
      receivedQuantity: item.quantityReceived || 0,
      unitPrice: item.unitPrice || 0
    };
  });

  // Check quantities and prices
  for (const item of invoice.items) {
    const poItem = receivedMap[item.productId];
    if (!poItem) {
      throw new errors.ConflictError(`Invoice contains product ${item.productId} not found in PO.`);
    }
    
    if (item.quantity > poItem.receivedQuantity) {
      throw new errors.ConflictError(`Invoice quantity (${item.quantity}) exceeds received quantity (${poItem.receivedQuantity}) for product ${item.productId}.`);
    }

    if (item.unitCost > poItem.unitPrice) {
      // Prompt: Invoice unit price <= PO unit price
      throw new errors.ConflictError(`Invoice unit cost (${item.unitCost}) exceeds PO unit price (${poItem.unitPrice}) for product ${item.productId}.`);
    }
  }
};

const resolveApprovalLevel = (totalAmount) => {
  if (totalAmount <= 50000) return 'AUTO';
  if (totalAmount <= 500000) return 'FINANCE_MANAGER';
  return 'FINANCE_HEAD';
};

const { publishAdminEvent } = require('../events/publisher');

const publishEvent = (eventName, payload) => {
  return publishAdminEvent(eventName, payload).catch(err => {
    require('@freshmart/service-shared').logger.error(`Failed to publish ${eventName}`, err);
  });
};

const createInvoice = async (data, context = {}) => {
  // Check supplier uniqueness
  const exists = await vendorInvoiceRepo.checkInvoiceNumberExists(data.supplierId, data.invoiceNumber);
  if (exists) {
    throw new errors.ConflictError(`Invoice number ${data.invoiceNumber} already exists for supplier ${data.supplierId}`);
  }

  // Validate Supplier & PO exist
  await getSupplierOrThrow(data.supplierId);
  const po = await getPurchaseOrderOrThrow(data.purchaseOrderId);

  if (po.status === 'CANCELLED') {
    throw new errors.ConflictError(`Cannot invoice against a cancelled PO (${po.adminItemId})`);
  }

  const dueDate = calculateDueDate(data.invoiceDate, data.paymentTerms);
  const now = new Date().toISOString();

  const invoiceData = {
    ...data,
    dueDate,
    paidAmount: 0,
    balanceAmount: data.totalAmount,
    creditNoteAmount: 0,
    adjustedAmount: 0,
    payments: [],
    approvalStatus: 'PENDING',
    paymentStatus: 'UNPAID',
    statusHistory: [
      { status: 'DRAFT', action: 'Created', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: 'Invoice created' }
    ]
  };

  const invoice = await vendorInvoiceRepo.createInvoice(invoiceData, context);
  publishEvent('InvoiceCreated', invoice);
  return invoice;
};

const updateInvoice = async (id, data, context = {}) => {
  const current = await getInvoiceOrThrow(id);
  if (current.status !== 'DRAFT') {
    throw new errors.ConflictError(`Cannot update invoice in status ${current.status}`);
  }

  if (data.invoiceNumber && data.invoiceNumber !== current.data.invoiceNumber) {
    const exists = await vendorInvoiceRepo.checkInvoiceNumberExists(current.data.supplierId, data.invoiceNumber);
    if (exists) {
      throw new errors.ConflictError(`Invoice number ${data.invoiceNumber} already exists for supplier ${current.data.supplierId}`);
    }
  }

  let dueDate = current.data.dueDate;
  if (data.invoiceDate || data.paymentTerms) {
    dueDate = calculateDueDate(data.invoiceDate || current.data.invoiceDate, data.paymentTerms || current.data.paymentTerms);
  }

  const updatedData = {
    ...current.data,
    ...data,
    dueDate,
    balanceAmount: (data.totalAmount !== undefined ? data.totalAmount : current.data.totalAmount) - current.data.paidAmount - current.data.adjustedAmount,
  };

  updatedData.statusHistory = [
    ...(current.data.statusHistory || []),
    { status: 'DRAFT', action: 'Updated', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: 'Invoice updated' }
  ];

  return await vendorInvoiceRepo.saveInvoice(id, updatedData, 'DRAFT', current.version, context);
};

const submitInvoice = async (id, context = {}) => {
  const invoice = await getInvoiceOrThrow(id);
  if (invoice.status !== 'DRAFT') {
    throw new errors.ConflictError(`Cannot submit invoice in status ${invoice.status}`);
  }

  const updatedData = {
    ...invoice.data,
    approvalStatus: 'PENDING',
    statusHistory: [
      ...(invoice.data.statusHistory || []),
      { status: 'SUBMITTED', action: 'Submitted', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: 'Invoice submitted for approval' }
    ]
  };

  const updated = await vendorInvoiceRepo.saveInvoice(id, updatedData, 'SUBMITTED', invoice.version, context);
  publishEvent('InvoiceSubmitted', updated);
  return updated;
};

const approveInvoice = async (id, payload, context = {}) => {
  const invoice = await getInvoiceOrThrow(id);
  if (invoice.status !== 'SUBMITTED') {
    throw new errors.ConflictError(`Cannot approve invoice in status ${invoice.status}`);
  }

  const po = await getPurchaseOrderOrThrow(invoice.data.purchaseOrderId);
  check3WayMatch(invoice.data, po);

  const level = resolveApprovalLevel(invoice.data.totalAmount);
  const now = new Date().toISOString();

  const updatedData = {
    ...invoice.data,
    approvalStatus: 'APPROVED',
    approvalLevel: level,
    approvedBy: context.userId || 'SYSTEM',
    approvedAt: now,
    statusHistory: [
      ...(invoice.data.statusHistory || []),
      { status: 'APPROVED', action: 'Approved', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: payload.remarks || `Approved at level ${level}` }
    ]
  };

  const updated = await vendorInvoiceRepo.saveInvoice(id, updatedData, 'APPROVED', invoice.version, context);
  publishEvent('InvoiceApproved', updated);
  return updated;
};

const rejectInvoice = async (id, payload, context = {}) => {
  const invoice = await getInvoiceOrThrow(id);
  if (invoice.status !== 'SUBMITTED') {
    throw new errors.ConflictError(`Cannot reject invoice in status ${invoice.status}`);
  }

  const updatedData = {
    ...invoice.data,
    approvalStatus: 'REJECTED',
    statusHistory: [
      ...(invoice.data.statusHistory || []),
      { status: 'REJECTED', action: 'Rejected', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: payload.rejectionReason }
    ]
  };

  const updated = await vendorInvoiceRepo.saveInvoice(id, updatedData, 'REJECTED', invoice.version, context);
  publishEvent('InvoiceRejected', updated);
  return updated;
};

const cancelInvoice = async (id, payload, context = {}) => {
  const invoice = await getInvoiceOrThrow(id);
  if (invoice.data.paidAmount > 0) {
    throw new errors.ConflictError(`Cannot cancel invoice that has payments recorded`);
  }

  const updatedData = {
    ...invoice.data,
    statusHistory: [
      ...(invoice.data.statusHistory || []),
      { status: 'CANCELLED', action: 'Cancelled', changedBy: context.userId || 'SYSTEM', changedAt: new Date().toISOString(), remarks: payload.cancelReason }
    ]
  };

  const updated = await vendorInvoiceRepo.saveInvoice(id, updatedData, 'CANCELLED', invoice.version, context);
  publishEvent('InvoiceCancelled', updated);
  return updated;
};

const recordPayment = async (id, payload, context = {}) => {
  const invoice = await getInvoiceOrThrow(id);
  if (invoice.status !== 'APPROVED' && invoice.status !== 'PARTIALLY_PAID') {
    throw new errors.ConflictError(`Cannot record payment for invoice in status ${invoice.status}`);
  }

  const amount = Number(payload.amount);
  if (amount > invoice.data.balanceAmount) {
    throw new errors.ConflictError(`Payment amount (${amount}) exceeds balance (${invoice.data.balanceAmount})`);
  }

  // Prevent duplicate reference numbers in the same invoice
  const existingPayments = invoice.data.payments || [];
  if (existingPayments.some(p => p.referenceNumber === payload.referenceNumber)) {
    throw new errors.ConflictError(`Payment reference ${payload.referenceNumber} already exists`);
  }

  const now = new Date().toISOString();
  const payment = {
    paymentId: `PAY_${randomUUID().slice(0, 8)}`,
    paymentDate: payload.paymentDate,
    amount,
    method: payload.method,
    referenceNumber: payload.referenceNumber,
    bankName: payload.bankName,
    remarks: payload.remarks,
    paidBy: context.userId || 'SYSTEM',
    recordedAt: now,
  };

  const newPaidAmount = invoice.data.paidAmount + amount;
  const newBalance = invoice.data.totalAmount - newPaidAmount - invoice.data.adjustedAmount;
  let newPaymentStatus = invoice.data.paymentStatus;
  let newStatus = invoice.status;

  if (newBalance <= 0) {
    newPaymentStatus = newBalance < 0 ? 'OVERPAID' : 'PAID';
    newStatus = 'PAID';
  } else {
    newPaymentStatus = 'PARTIALLY_PAID';
    newStatus = 'PARTIALLY_PAID';
  }

  const updatedData = {
    ...invoice.data,
    paidAmount: newPaidAmount,
    balanceAmount: newBalance,
    paymentStatus: newPaymentStatus,
    payments: [...existingPayments, payment],
    statusHistory: [
      ...(invoice.data.statusHistory || []),
      { status: newStatus, action: 'Payment Added', changedBy: context.userId || 'SYSTEM', changedAt: now, remarks: `Payment of ${amount} recorded` }
    ]
  };

  const updated = await vendorInvoiceRepo.saveInvoice(id, updatedData, newStatus, invoice.version, context);
  publishEvent('PaymentRecorded', payment);
  
  if (newStatus === 'PAID') {
    publishEvent('InvoicePaid', updated);
  }
  
  return updated;
};

module.exports = {
  createInvoice,
  updateInvoice,
  submitInvoice,
  approveInvoice,
  rejectInvoice,
  cancelInvoice,
  recordPayment,
};
