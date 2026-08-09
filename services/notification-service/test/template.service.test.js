const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  renderWelcomeBackEmail,
  renderWelcomeNewCustomerEmail,
  renderOrderPlacedEmail,
  renderPaymentSuccessEmail,
  renderOrderStatusEmail,
  renderPasswordResetEmail,
  renderInventoryAlertEmail,
} = require('../src/templates');

describe('Notification Service Template System', () => {
  it('renders Welcome Back Email with branding and security details', () => {
    const result = renderWelcomeBackEmail({
      customerName: 'Mathan',
      loginTime: '2026-08-05T19:00:00.000Z',
      device: 'Chrome / Windows',
      ip: '192.168.1.1',
    });

    assert.ok(result.subject.includes('Welcome back to FreshMart!'));
    assert.ok(result.html.includes('Mathan'));
    assert.ok(result.html.includes('FreshMart'));
    assert.ok(result.html.includes('support@freshmart.com'));
  });

  it('renders Customer Registered Welcome Email with coupon code', () => {
    const result = renderWelcomeNewCustomerEmail({ customerName: 'Mathan' });
    assert.strictEqual(result.subject, 'Welcome to FreshMart');
    assert.ok(result.html.includes('FRESH100'));
    assert.ok(result.html.includes('Mathan'));
  });

  it('renders Order Placed Email with item table and total', () => {
    const result = renderOrderPlacedEmail({
      customerName: 'Mathan',
      orderId: 'FM-1001',
      items: [{ name: 'Fresh Apples 1kg', quantity: 2, price: 120 }],
      total: 240,
      currency: 'INR',
      deliveryAddress: 'Bengaluru',
      estimatedDelivery: '10 Mins',
    });

    assert.ok(result.subject.includes('Order Confirmed 🎉 (#FM-1001)'));
    assert.ok(result.html.includes('Fresh Apples 1kg'));
    assert.ok(result.html.includes('₹240.00'));
    assert.ok(result.html.includes('10 Mins'));
  });

  it('renders Payment Success Receipt Email', () => {
    const result = renderPaymentSuccessEmail({
      customerName: 'Mathan',
      orderId: 'FM-1001',
      transactionId: 'TXN-998877',
      amount: 240,
      paymentMethod: 'UPI',
    });

    assert.ok(result.subject.includes('Payment Successful'));
    assert.ok(result.html.includes('TXN-998877'));
    assert.ok(result.html.includes('₹240.00'));
  });

  it('renders Order Status Update Email', () => {
    const result = renderOrderStatusEmail({
      customerName: 'Mathan',
      orderId: 'FM-1001',
      status: 'OUT_FOR_DELIVERY',
      statusLabel: 'Out for Delivery',
      description: 'Your order is out for delivery!',
    });

    assert.ok(result.subject.includes('Order #FM-1001: Out for Delivery'));
    assert.ok(result.html.includes('Out for Delivery'));
  });

  it('renders Password Reset Email', () => {
    const result = renderPasswordResetEmail({
      customerName: 'Mathan',
      resetTokenUrl: 'https://freshmart.dev/reset?token=xyz123',
    });

    assert.ok(result.subject.includes('Reset Your FreshMart Password'));
    assert.ok(result.html.includes('https://freshmart.dev/reset?token=xyz123'));
  });

  it('renders Inventory Low Admin Alert Email', () => {
    const result = renderInventoryAlertEmail({
      sku: 'PROD-MILK-1L',
      productName: 'Organic Milk 1L',
      currentStock: 3,
      threshold: 10,
      warehouse: 'WH-BLR-01',
    });

    assert.ok(result.subject.includes('[ADMIN ALERT] Low Inventory'));
    assert.ok(result.html.includes('PROD-MILK-1L'));
    assert.ok(result.html.includes('3 units'));
  });
});
