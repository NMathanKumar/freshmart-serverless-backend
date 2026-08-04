const fulfillmentEventHandlers = require('./fulfillment-event.handlers');

// STUB: This represents the entry point for an EventBridge / SQS lambda trigger
const handleFulfillmentEvent = async (event) => {
  console.log(`[EventConsumer] Received fulfillment event: ${event.type}`);
  switch (event.type) {
    case 'OrderAllocated': return fulfillmentEventHandlers.onOrderAllocated(event.payload);
    case 'PickListGenerated': return fulfillmentEventHandlers.onPickListGenerated(event.payload);
    case 'OrderPacked': return fulfillmentEventHandlers.onOrderPacked(event.payload);
    case 'OrderDispatched': return fulfillmentEventHandlers.onOrderDispatched(event.payload);
    default: console.log(`[EventConsumer] Unhandled fulfillment event type: ${event.type}`);
  }
};

module.exports = { handleFulfillmentEvent };
