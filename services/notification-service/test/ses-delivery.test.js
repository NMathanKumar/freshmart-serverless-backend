const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const sesProvider = require('../src/providers/ses.provider');
const { SESProvider } = require('../src/providers/ses.provider');
const handleOrderPlaced = require('../src/handlers/order-placed.handler');
const { handleBounceEvent } = require('../src/handlers/bounce.handler');
const { handleComplaintEvent } = require('../src/handlers/complaint.handler');
const idempotencyRepository = require('../src/repository/idempotency.repository');

describe('SES Email Delivery & Resilience Suite', () => {
  it('instantiates SES provider with configurable sender and region', () => {
    const customProvider = new SESProvider({
      region: 'ap-southeast-1',
      fromEmail: 'test-noreply@freshmart.com',
      brandName: 'FreshMart Test',
      maxAttempts: 3,
    });

    assert.equal(customProvider.region, 'ap-southeast-1');
    assert.equal(customProvider.fromEmail, 'test-noreply@freshmart.com');
    assert.equal(customProvider.brandName, 'FreshMart Test');
    assert.equal(customProvider.maxAttempts, 3);
  });

  it('sends email via SES with fallback mock in local test environment', async () => {
    const result = await sesProvider.sendEmail({
      to: 'customer@freshmart.com',
      subject: 'Order Confirmed #ORDER_TEST_001',
      htmlBody: '<h1>Order Confirmed</h1><p>Total: ₹250.00</p>',
      textBody: 'Order Confirmed. Total: ₹250.00',
      context: { eventId: 'evt_test_ses_001' },
    });

    assert.equal(result.success, true);
    assert.ok(result.messageId);
    assert.ok(result.attempt >= 1);
  });

  it('suppresses duplicate events via idempotency repository', async () => {
    const eventId = `evt_dedup_${Date.now()}`;

    // First check should be false (not yet processed)
    const isFirstProcessed = await idempotencyRepository.isProcessed(eventId);
    assert.equal(isFirstProcessed, false);

    // Mark processed
    await idempotencyRepository.markProcessed(eventId, { type: 'ORDER_CONFIRMED' });

    // Second check should be true (suppressed)
    const isSecondProcessed = await idempotencyRepository.isProcessed(eventId);
    assert.equal(isSecondProcessed, true);
  });

  it('processes permanent SES bounce events and flags suppression', async () => {
    const bounceEvent = {
      id: 'evt_bounce_001',
      'detail-type': 'ses.bounce',
      detail: {
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'General',
          bouncedRecipients: [
            { emailAddress: 'invalid-user@example.com' },
          ],
          feedbackId: 'fb_12345',
        },
      },
    };

    const result = await handleBounceEvent(bounceEvent, { requestId: 'req_test_bounce' });
    assert.equal(result.status, 'PROCESSED');
    assert.equal(result.bounceType, 'Permanent');
    assert.equal(result.suppressed, true);
    assert.deepEqual(result.bouncedRecipients, ['invalid-user@example.com']);
  });

  it('processes SES complaint events and flags suppression', async () => {
    const complaintEvent = {
      id: 'evt_complaint_001',
      'detail-type': 'ses.complaint',
      detail: {
        complaint: {
          complaintFeedbackType: 'abuse',
          complainedRecipients: [
            { emailAddress: 'complainer@example.com' },
          ],
          feedbackId: 'fb_complaint_999',
        },
      },
    };

    const result = await handleComplaintEvent(complaintEvent, { requestId: 'req_test_complaint' });
    assert.equal(result.status, 'PROCESSED');
    assert.equal(result.complaintFeedbackType, 'abuse');
    assert.equal(result.suppressed, true);
  });

  it('processes order placed event and formats order confirmation without crashing', async () => {
    const orderPayload = {
      orderId: 'ORDER_AUTO_TEST_101',
      customerEmail: 'test-customer@freshmart.com',
      customerName: 'Aarav Sharma',
      totalAmount: 189.50,
      paymentMethod: 'UPI (SUCCESS)',
      estimatedDelivery: '10 Mins',
      items: [
        { name: 'Organic Bananas', price: 60, quantity: 2, lineTotal: 120 },
        { name: 'Fresh Whole Milk', price: 69.50, quantity: 1, lineTotal: 69.50 },
      ],
      deliveryAddressData: {
        line1: 'Flat 402, Green Valley Apartments',
      },
    };

    const result = await handleOrderPlaced(orderPayload, {
      eventId: `evt_order_${Date.now()}`,
      correlationId: 'corr_test_001',
    });

    assert.ok(result);
    assert.ok(result.status === 'DELIVERED' || result.status === 'DISPATCHED');
  });
});
