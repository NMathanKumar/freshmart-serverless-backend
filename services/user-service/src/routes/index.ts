import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createUserController } from '../controllers/index.js';
import { DynamoUserRepository } from '../repositories/index.js';
import { UserService } from '../services/index.js';

const config = loadConfig('user-service', {
  USER_TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createUserController(new UserService(new DynamoUserRepository(config.USER_TABLE_NAME)));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/users/profile',
    authorize: true,
    handler: ({ auth }) => controller.getProfile(auth.subject ?? '')
  },
  {
    method: 'PUT',
    path: '/api/v1/users/profile',
    authorize: true,
    handler: ({ auth, body }) => controller.upsertProfile(auth.subject ?? '', body)
  },
  {
    method: 'POST',
    path: '/api/v1/users/addresses',
    authorize: true,
    handler: ({ auth, body }) => controller.addAddress(auth.subject ?? '', body)
  },
  {
    method: 'DELETE',
    path: '/api/v1/users/addresses/:addressId',
    authorize: true,
    handler: ({ auth, params }) => controller.deleteAddress(auth.subject ?? '', params?.addressId ?? '')
  }
];

export const handler = createLambdaHandler({
  serviceName: 'user-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
