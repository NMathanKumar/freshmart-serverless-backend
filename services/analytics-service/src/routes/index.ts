import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createController } from '../controllers/index.js';
import { DynamoStoreRepository } from '../repositories/index.js';
import { AnalyticsService, createEventPublisher } from '../services/index.js';

const config = loadConfig('analytics-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createController(new AnalyticsService(new DynamoStoreRepository(config.TABLE_NAME), createEventPublisher()));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/analytics/snapshots',
    authorize: true,
    handler: () => controller.list()
  },
  {
    method: 'GET',
    path: '/api/v1/analytics/snapshots/:snapshotId',
    authorize: true,
    handler: ({ params }) => controller.getById(params.snapshotId)
  },
  {
    method: 'POST',
    path: '/api/v1/analytics/snapshots',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ body }) => controller.upsert(body)
  }
];

export const handler = createLambdaHandler({
  serviceName: 'analytics-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
