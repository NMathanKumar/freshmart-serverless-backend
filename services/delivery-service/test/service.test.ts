import test from 'node:test';
import assert from 'node:assert';
import { DeliveryService } from '../src/services/DeliveryService.js';
import type { DynamoDeliveryRepository } from '../src/repositories/DynamoDeliveryRepository.js';
import type { Delivery } from '../src/entities/Delivery.js';

const deliveries: Delivery[] = [];

const mockRepo = {
  save: async (d: Delivery) => {
    const idx = deliveries.findIndex(x => x.deliveryId === d.deliveryId);
    if (idx >= 0) deliveries[idx] = d;
    else deliveries.push(d);
    return d;
  },
  getById: async (id: string) => deliveries.find(x => x.deliveryId === id) || null,
  getByOrder: async (orderId: string) => deliveries.filter(x => x.orderId === orderId)
} as unknown as DynamoDeliveryRepository;

test('DeliveryService', async (t) => {
  const service = new DeliveryService(mockRepo);

  await t.test('createDelivery', async () => {
    const created = await service.createDelivery({
      orderId: 'ord-1',
      address: 'Test Addr',
      estimatedTime: '15 mins'
    });
    assert.strictEqual(created.status, 'PENDING');
    assert.strictEqual(created.orderId, 'ord-1');

    const fetched = await service.getById(created.deliveryId);
    assert.deepEqual(fetched, created);
  });

  await t.test('assignPartner', async () => {
    const list = await service.getByOrder('ord-1');
    assert.strictEqual(list.length, 1);

    const updated = await service.assignPartner(list[0].deliveryId, 'partner-99');
    assert.strictEqual(updated.status, 'ASSIGNED');
    assert.strictEqual(updated.partnerId, 'partner-99');
  });
});
