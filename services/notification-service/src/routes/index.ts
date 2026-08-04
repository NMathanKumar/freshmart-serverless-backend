import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createNotificationController } from '../controllers/index.js';
import { DynamoNotificationRepository } from '../repositories/index.js';
import { NotificationService } from '../services/index.js';

const config = loadConfig('notification-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createNotificationController(new NotificationService(new DynamoNotificationRepository(config.TABLE_NAME)));
export const routes: RouteDefinition[] = [
  { method: 'GET', path: '/api/v1/notifications/:recipientUserId', authorize: true, handler: ({ params }) => controller.list(params.recipientUserId) },
  { method: 'POST', path: '/api/v1/notifications', authorize: true, roles: ['admin', 'operations'], handler: ({ body }) => controller.create(body) },
  { method: 'POST', path: '/api/v1/notifications/:notificationId/read', authorize: true, handler: ({ params, body }) => controller.markRead(params.notificationId, body) }
];
export const handler = createLambdaHandler({
  serviceName: 'notification-service',
  routes,
  authorizer: { userPoolId: config.COGNITO_USER_POOL_ID, clientId: config.COGNITO_APP_CLIENT_ID, tokenUse: 'access' }
});
