import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createUserController } from '../controllers/index.js';
import { DynamoUserRepository } from '../repositories/index.js';
import { UserService } from '../services/index.js';

const config = {
  USER_TABLE_NAME: process.env.DDB_TABLE_USER_PROFILES || process.env.USER_TABLE_NAME || 'freshmart-dev-user-profiles',
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || 'ap-southeast-1_RXGKIq89c',
  COGNITO_APP_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID || process.env.COGNITO_APP_CLIENT_ID || '5qeg7to1eroscp415s5jqicvt2',
};

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
