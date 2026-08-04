const procurementEventHandlers = require('./procurement-event.handlers');

// STUB: This represents the entry point for an EventBridge / SQS lambda trigger
const handleProcurementEvent = async (event) => {
  console.log(`[EventConsumer] Received event: ${event.type}`);
  switch (event.type) {
    case 'PurchaseOrderCreated': return procurementEventHandlers.onPurchaseOrderCreated(event.payload);
    case 'PurchaseOrderApproved': return procurementEventHandlers.onPurchaseOrderApproved(event.payload);
    case 'PurchaseOrderReceived': return procurementEventHandlers.onPurchaseOrderReceived(event.payload);
    case 'RTVCreated': return procurementEventHandlers.onVendorReturnCreated(event.payload);
    case 'RTVDispatched': return procurementEventHandlers.onVendorReturnDispatched(event.payload);
    case 'RTVCreditNoteRecorded': return procurementEventHandlers.onCreditNoteReceived(event.payload);
    case 'InvoiceApproved': return procurementEventHandlers.onVendorInvoiceApproved(event.payload);
    case 'PaymentRecorded': return procurementEventHandlers.onPaymentRecorded(event.payload);
    default: console.log(`[EventConsumer] Unhandled event type: ${event.type}`);
  }
};
module.exports = { handleProcurementEvent };
