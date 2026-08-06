// @ts-ignore
import config from './config';
// @ts-ignore
import logger from './logger';
// @ts-ignore
import aws from './aws/clients';
// @ts-ignore
import dynamodb from './aws/dynamodb';
// @ts-ignore
import events from './events/envelope';
// @ts-ignore
import eventPublisher from './events/publisher';
// @ts-ignore
import validation from './validation';
// @ts-ignore
import middleware from './middleware';
// @ts-ignore
import auth from './auth';
// @ts-ignore
import constants from './constants';
// @ts-ignore
import response from './response/apiResponse';
// @ts-ignore
import integrations from './integrations';
// @ts-ignore
import errors from './errors/ApiError';
// @ts-ignore
import asyncHandler from './utils/asyncHandler';
// @ts-ignore
import id from './utils/id';
// @ts-ignore
import pagination from './utils/pagination';
// @ts-ignore
import runtime from './runtime';
// @ts-ignore
import metrics from './metrics';

export {
  config,
  logger,
  aws,
  dynamodb,
  events,
  eventPublisher,
  validation,
  middleware,
  auth,
  constants,
  response,
  integrations,
  errors
};

export {
  getAccessToken,
  getCurrentUser,
  getEnvironmentUrls,
  isAdmin,
  isCustomer,
  isAuthenticated,
  logout,
  sharedSessionAccessor,
  login,
  initializeSession,
  requireAdmin,
  requireCustomer,
  getSession,
  saveSession,
  clearSession
} from './shared-auth.js';

export const utils = {
  asyncHandler,
  id,
  pagination
};

export const createServiceApp = runtime?.createServiceApp;
export const createLambdaHandler = runtime?.createLambdaHandler;
export const createEventLambda = runtime?.createEventLambda;
export { metrics };

export * from './routing.js';
export * from './shared-auth.js';
export * from './storage.js';
export * from './types.js';
export * from './config-validation.js';
export * from './auth-types.js';
