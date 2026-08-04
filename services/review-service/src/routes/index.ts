import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createController } from '../controllers/index.js';
import { DynamoStoreRepository } from '../repositories/index.js';
import { ReviewService, createEventPublisher } from '../services/index.js';

const config = loadConfig('review-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createController(new ReviewService(new DynamoStoreRepository(config.TABLE_NAME), createEventPublisher()));

export const routes: RouteDefinition[] = [
  // Customer GET / (with productId query param)
  {
    method: 'GET',
    path: '/api/v1/reviews',
    authorize: true,
    handler: ({ query }) => {
      const productId = query?.productId;
      if (!productId) return { statusCode: 400, body: JSON.stringify({ message: 'productId query param is required' }) };
      return controller.listByProduct(productId);
    }
  },
  // Customer GET /:reviewId
  {
    method: 'GET',
    path: '/api/v1/reviews/:reviewId',
    authorize: true,
    handler: ({ params }) => controller.getById(params.reviewId)
  },
  // Customer POST /
  {
    method: 'POST',
    path: '/api/v1/reviews',
    authorize: true,
    handler: ({ body, auth }) => {
      if (!auth?.subject) return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
      return controller.create(body, auth.subject);
    }
  },
  // Admin GET /admin
  {
    method: 'GET',
    path: '/api/v1/reviews/admin',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: () => controller.listAdmin()
  },
  // Admin PUT /:reviewId
  {
    method: 'PUT',
    path: '/api/v1/reviews/:reviewId',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, body }) => controller.update(params.reviewId, body)
  },
  // Admin DELETE /:reviewId
  {
    method: 'DELETE',
    path: '/api/v1/reviews/:reviewId',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, query }) => controller.delete(params.reviewId, query?.hard === 'true')
  },
  // Admin POST /:reviewId/approve
  {
    method: 'POST',
    path: '/api/v1/reviews/:reviewId/approve',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, auth }) => controller.approve(params.reviewId, auth?.subject || 'admin')
  },
  // Admin POST /:reviewId/reject
  {
    method: 'POST',
    path: '/api/v1/reviews/:reviewId/reject',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, auth }) => controller.reject(params.reviewId, auth?.subject || 'admin')
  }
];

export const handler = createLambdaHandler({
  serviceName: 'review-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
