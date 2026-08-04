import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { HttpCustomerGateway } from '../../services/customer-bff-service/src/services/index.js';

const startServer = async () => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');

    const payloadByPath = new Map<string, unknown>([
      ['/api/v1/categories', [{ categoryId: 'cat-1', name: 'Fruits' }]],
      ['/api/v1/catalog/products', [{ productId: 'prod-1', name: 'Organic Banana', price: 45 }]],
      ['/api/v1/cart/customer-1', { items: [{ sku: 'BANANA-1KG' }], grandTotal: 45 }],
      ['/api/v1/promotions', [{ code: 'WELCOME10', title: 'Welcome', discountValue: 10 }]],
      ['/api/v1/users/profile', { addresses: [{ addressId: 'addr-1' }] }],
      ['/api/v1/orders', [{ orderId: 'order-1', customerId: 'customer-1', status: 'CREATED' }]],
      ['/api/v1/wishlist/customer-1', [{ productId: 'prod-1' }]],
      ['/api/v1/notifications/customer-1', [{ notificationId: 'note-1' }]],
      ['/api/v1/catalog/products/prod-1', { productId: 'prod-1', name: 'Organic Banana' }]
    ]);

    const payload = payloadByPath.get(request.url ?? '');
    if (!payload) {
      response.statusCode = 404;
      response.end(JSON.stringify({ message: 'missing' }));
      return;
    }

    response.end(JSON.stringify(payload));
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start integration server.');
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  };
};

test('customer bff http gateway aggregates customer views from downstream services', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const gateway = new HttpCustomerGateway({
      catalogBaseUrl: baseUrl,
      categoryBaseUrl: baseUrl,
      cartBaseUrl: baseUrl,
      orderBaseUrl: baseUrl,
      userBaseUrl: baseUrl,
      wishlistBaseUrl: baseUrl,
      notificationBaseUrl: baseUrl,
      promotionsBaseUrl: baseUrl
    });

    const home = await gateway.getHome('customer-1');
    const profile = await gateway.getProfile('customer-1');
    const notifications = await gateway.getNotifications('customer-1');

    assert.equal(home.categories.length, 1);
    assert.equal(profile.addresses.length, 1);
    assert.equal(notifications.notifications.length, 1);
  } finally {
    server.close();
  }
});
