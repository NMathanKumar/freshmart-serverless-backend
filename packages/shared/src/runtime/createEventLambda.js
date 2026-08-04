const createEventLambda = (consumerName, dispatchEvent) => {
  if (typeof consumerName !== 'string' || !consumerName.trim()) {
    throw new TypeError('createEventLambda requires a consumer name');
  }
  if (typeof dispatchEvent !== 'function') {
    throw new TypeError('createEventLambda requires a dispatchEvent function');
  }

  return async (event = {}, context = {}) => {
    context.callbackWaitsForEmptyEventLoop = false;

    // If it's an SQS Event, unwrap it and process each record
    if (event.Records && Array.isArray(event.Records)) {
      const results = [];
      for (const record of event.Records) {
        try {
          let eventBridgeEvent = JSON.parse(record.body);

          // When EventBridge → SNS → SQS, the SQS body is an SNS notification envelope.
          // The actual EventBridge event is JSON-encoded inside the "Message" field.
          if (eventBridgeEvent.Type === 'Notification' && typeof eventBridgeEvent.Message === 'string') {
            eventBridgeEvent = JSON.parse(eventBridgeEvent.Message);
          }

          const response = await dispatchEvent(eventBridgeEvent, context);
          results.push({ ...response, consumerName, messageId: record.messageId });
        } catch (error) {
          // If we fail processing one SQS record, throw so SQS retries / sends to DLQ
          console.error(`Failed to process SQS record ${record.messageId}`, error);
          throw error;
        }
      }
      return results;
    }

    // Otherwise, assume it's a direct EventBridge invocation
    const response = await dispatchEvent(event, context);
    return {
      ...response,
      consumerName,
    };
  };
};

module.exports = createEventLambda;
