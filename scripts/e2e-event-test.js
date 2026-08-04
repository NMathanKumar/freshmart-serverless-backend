const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const { SQSClient, GetQueueAttributesCommand } = require('@aws-sdk/client-sqs');

const REGION = 'ap-southeast-1';
const ACCOUNT_ID = '769044546162';

const eventBridge = new EventBridgeClient({ region: REGION });
const sqs = new SQSClient({ region: REGION });

const QUEUES = {
  notification: `https://sqs.${REGION}.amazonaws.com/${ACCOUNT_ID}/freshmart-dev-notification-processing`,
  inventory: `https://sqs.${REGION}.amazonaws.com/${ACCOUNT_ID}/freshmart-dev-inventory-processing`,
  analytics: `https://sqs.${REGION}.amazonaws.com/${ACCOUNT_ID}/freshmart-dev-analytics-processing`,
};

const DLQS = {
  notification: `https://sqs.${REGION}.amazonaws.com/${ACCOUNT_ID}/freshmart-dev-notification-processing-dlq`,
  inventory: `https://sqs.${REGION}.amazonaws.com/${ACCOUNT_ID}/freshmart-dev-inventory-processing-dlq`,
  analytics: `https://sqs.${REGION}.amazonaws.com/${ACCOUNT_ID}/freshmart-dev-analytics-processing-dlq`,
};

async function getQueueDepth(queueUrl) {
  const res = await sqs.send(new GetQueueAttributesCommand({
    QueueUrl: queueUrl,
    AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible', 'ApproximateNumberOfMessagesDelayed']
  }));
  const attrs = res.Attributes || {};
  return (parseInt(attrs.ApproximateNumberOfMessages || '0', 10) +
          parseInt(attrs.ApproximateNumberOfMessagesNotVisible || '0', 10));
}

async function testEventPipeline() {
  console.log('=== STARTING END-TO-END EVENT PIPELINE TEST ===\n');

  // 1. Initial DLQ Check
  console.log('--- Checking Initial DLQ States ---');
  for (const [name, url] of Object.entries(DLQS)) {
    const depth = await getQueueDepth(url);
    console.log(`DLQ ${name}: ${depth} messages`);
    if (depth > 0) {
      console.warn(`⚠️ Warning: DLQ ${name} has ${depth} leftover messages`);
    }
  }

  // Test Events Matrix
  const testEvents = [
    {
      source: 'freshmart.product-service',
      detailType: 'product.created',
      detail: JSON.stringify({
        event: 'product.created',
        product: { productId: `test-prod-${Date.now()}`, name: 'Test Fresh Apple', category: 'fruits', price: 2.99 }
      }),
      expectedConsumers: ['analytics-service']
    },
    {
      source: 'freshmart.inventory-service',
      detailType: 'inventory.low_stock',
      detail: JSON.stringify({
        event: 'inventory.low_stock',
        inventory: { inventoryId: `inv-${Date.now()}`, productId: `test-prod-${Date.now()}`, currentStock: 2, minThreshold: 5 }
      }),
      expectedConsumers: ['notification-service', 'analytics-service']
    },
    {
      source: 'freshmart.order-service',
      detailType: 'order.placed',
      detail: JSON.stringify({
        event: 'order.placed',
        order: { orderId: `ord-${Date.now()}`, customerId: 'cust-123', totalAmount: 49.99, items: [] }
      }),
      expectedConsumers: ['notification-service', 'analytics-service']
    },
    {
      source: 'freshmart.payment-service',
      detailType: 'payment.succeeded',
      detail: JSON.stringify({
        event: 'payment.succeeded',
        payment: { paymentId: `pay-${Date.now()}`, orderId: `ord-${Date.now()}`, amount: 49.99, method: 'CARD' }
      }),
      expectedConsumers: ['notification-service', 'analytics-service']
    }
  ];

  const results = [];

  for (const testEv of testEvents) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Publishing event: ${testEv.detailType} (${testEv.source})`);

    const publishStart = Date.now();
    const putRes = await eventBridge.send(new PutEventsCommand({
      Entries: [{
        EventBusName: 'freshmart-dev-events',
        Source: testEv.source,
        DetailType: testEv.detailType,
        Detail: testEv.detail
      }]
    }));

    const publishLatency = Date.now() - publishStart;
    const eventId = putRes.Entries?.[0]?.EventId;
    const errorCode = putRes.Entries?.[0]?.ErrorCode;

    if (errorCode) {
      console.error(`❌ Failed to publish ${testEv.detailType}: ${errorCode}`);
      results.push({ detailType: testEv.detailType, success: false, error: errorCode });
      continue;
    }

    console.log(`✅ Event Published! EventId: ${eventId} (Latency: ${publishLatency}ms)`);

    // Wait 5 seconds for processing
    console.log('Waiting 5 seconds for EB -> SNS -> SQS -> Consumer processing...');
    await new Promise(r => setTimeout(r, 5000));

    // Check DLQs
    let dlqClean = true;
    for (const [name, url] of Object.entries(DLQS)) {
      const depth = await getQueueDepth(url);
      if (depth > 0) {
        console.error(`❌ DLQ ${name} has ${depth} messages after ${testEv.detailType}!`);
        dlqClean = false;
      }
    }

    results.push({
      detailType: testEv.detailType,
      eventId,
      publishLatency,
      dlqClean,
      success: !!eventId && dlqClean
    });
  }

  // 2. Final DLQ check & Queue Depths
  console.log('\n--- Final Queue & DLQ Depth Verification ---');
  let allQueuesClean = true;
  for (const [name, url] of Object.entries(QUEUES)) {
    const depth = await getQueueDepth(url);
    console.log(`Queue ${name}: ${depth} pending messages`);
    if (depth > 0) allQueuesClean = false;
  }
  for (const [name, url] of Object.entries(DLQS)) {
    const depth = await getQueueDepth(url);
    console.log(`DLQ ${name}: ${depth} failed messages`);
    if (depth > 0) allQueuesClean = false;
  }

  console.log('\n=================== TEST RESULTS SUMMARY ===================');
  results.forEach(r => {
    console.log(`${r.success ? '✅ PASS' : '❌ FAIL'} | ${r.detailType} | Pub: ${r.publishLatency}ms | EventId: ${r.eventId}`);
  });

  if (allQueuesClean && results.every(r => r.success)) {
    console.log('\n🎉 ALL PIPELINE VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ PIPELINE VERIFICATION HAD FAILURES OR UNCONSUMED MESSAGES.');
    process.exit(1);
  }
}

testEventPipeline().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
