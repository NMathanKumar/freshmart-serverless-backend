import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryNotificationRepository } from '../src/repositories/index.js';
import { NotificationService } from '../src/services/index.js';

test('notification service creates notifications', async () => {
  const service = new NotificationService(new InMemoryNotificationRepository());
  await service.create({
    recipientUserId: 'user-1',
    type: 'SYSTEM',
    title: 'FreshMart',
    message: 'Welcome'
  });
  const notifications = await service.listByUser('user-1');
  assert.equal(notifications.length, 1);
});
