export const formatCurrency = (value: number) =>
  typeof value === 'number' ? `₹${value.toFixed(2)}` : '₹0.00';

export * from './routing.js';
export * from './shared-auth.js';
export * from './storage.js';
export * from './types.js';
export * from './config-validation.js';
export * from './auth-types.js';
export * from './auth/AuthGuard.js';
export * from './auth/sso.js';
