const repository = require('../repositories/procurement.repository');

const getDates = (payload) => {
  const dateStr = payload.createdAt || new Date().toISOString();
  return {
    date: dateStr.split('T')[0],
    month: dateStr.substring(0, 7),
  };
};

const onPurchaseOrderCreated = async (payload) => {
  const { date, month } = getDates(payload);
  const totalAmount = Number(payload.totalAmount) || 0;
  
  await Promise.all([
    repository.incrementMetric(date, month, 'totalPurchaseOrders', 1),
    repository.incrementMetric(date, month, 'totalPurchaseValue', totalAmount),
  ]);
};

const onPurchaseOrderApproved = async (payload) => {
  const { date, month } = getDates(payload);
  await repository.incrementMetric(date, month, 'totalApprovedPurchaseOrders', 1);
};

const onPurchaseOrderReceived = async (payload) => {
  const { date, month } = getDates(payload);
  
  let receivedAmount = Number(payload.receivedAmount) || 0;
  if (!receivedAmount && payload.items && Array.isArray(payload.items)) {
    receivedAmount = payload.items.reduce((acc, item) => {
      const qty = Number(item.receivedQuantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return acc + (qty * price);
    }, 0);
  }
  
  if (receivedAmount > 0) {
    await repository.incrementMetric(date, month, 'totalReceivedPurchaseValue', receivedAmount);
  }
};

const onVendorReturnCreated = async (payload) => {
  const { date, month } = getDates(payload);
  const totalAmount = Number(payload.totalAmount) || 0;
  
  await Promise.all([
    repository.incrementMetric(date, month, 'totalVendorReturns', 1),
    repository.incrementMetric(date, month, 'totalReturnValue', totalAmount),
  ]);
};

const onVendorReturnDispatched = async (payload) => {
  // Task 1 mentions onVendorReturnDispatched, but Task 3 doesn't assign specific metrics for it.
  // We can just log it or add a generic counter if needed, but per instructions no specific metric.
  return Promise.resolve();
};

const onCreditNoteReceived = async (payload) => {
  const { date, month } = getDates(payload);
  const creditNoteAmount = Number(payload.creditNoteAmount) || Number(payload.amount) || 0;
  
  if (creditNoteAmount > 0) {
    await repository.incrementMetric(date, month, 'totalCreditRecovered', creditNoteAmount);
  }
};

const onVendorInvoiceApproved = async (payload) => {
  const { date, month } = getDates(payload);
  const totalAmount = Number(payload.totalAmount) || 0;
  
  if (totalAmount > 0) {
    await repository.incrementMetric(date, month, 'outstandingPayables', totalAmount);
  }
};

const onPaymentRecorded = async (payload) => {
  const { date, month } = getDates(payload);
  const amount = Number(payload.amount) || 0;
  
  if (amount > 0) {
    await Promise.all([
      repository.incrementMetric(date, month, 'outstandingPayables', -amount),
      repository.incrementMetric(date, month, 'procurementSpend', amount),
    ]);
  }
};

module.exports = {
  onPurchaseOrderCreated,
  onPurchaseOrderApproved,
  onPurchaseOrderReceived,
  onVendorReturnCreated,
  onVendorReturnDispatched,
  onCreditNoteReceived,
  onVendorInvoiceApproved,
  onPaymentRecorded,
};
