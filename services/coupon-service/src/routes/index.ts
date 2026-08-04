import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createController } from '../controllers/index.js';
import { DynamoCouponRepository } from '../repositories/index.js';
import { CouponService } from '../services/index.js';

const config = loadConfig('coupon-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createController(new CouponService(new DynamoCouponRepository(config.TABLE_NAME)));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/admin/coupons',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: () => controller.list()
  },
  {
    method: 'GET',
    path: '/api/v1/admin/coupons/:couponId',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ params }) => controller.getById(params.couponId)
  },
  {
    method: 'POST',
    path: '/api/v1/admin/coupons',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ auth, body }) => controller.upsert((body as Record<string, unknown>) ?? {}, auth.subject)
  },
  {
    method: 'PUT',
    path: '/api/v1/admin/coupons/:couponId',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ auth, body, params }) => controller.upsert({ ...(body as Record<string, unknown>), couponId: params.couponId }, auth.subject)
  },
  {
    method: 'POST',
    path: '/api/v1/coupons/validate',
    authorize: true,
    handler: ({ body }) => controller.validateCoupon((body as Record<string, unknown>) ?? {})
  },
  {
    method: 'POST',
    path: '/api/v1/coupons/redeem',
    authorize: true,
    handler: ({ body }) => controller.redeemCoupon((body as Record<string, unknown>) ?? {})
  }
];

export const handler = createLambdaHandler({
  serviceName: 'coupon-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
