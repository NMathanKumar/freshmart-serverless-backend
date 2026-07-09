/**
 * Shared application-level constants.
 *
 * WHY this file exists:
 * Magic strings like 'PENDING', 'SUCCESS', 'PLACED', 'CUSTOMER' were scattered
 * as literals across service, repository, and validator files. A single typo
 * ('SUCESSS') silently produces a wrong DB update with no error. Centralising
 * them here means:
 *   1. One change propagates everywhere automatically.
 *   2. IDEs autocomplete — no typos.
 *   3. Future modules (Inventory, Notifications) import the same constants
 *      instead of re-declaring their own strings.
 *
 * RULES:
 *   - Only values used across MORE THAN ONE module belong here.
 *   - No HTTP objects (req/res), no Express, no business logic.
 */

// ---------------------------------------------------------------------------
// User roles  (users.role ENUM in schema.sql)
// ---------------------------------------------------------------------------
const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
});

// ---------------------------------------------------------------------------
// Order status  (orders.order_status ENUM in schema.sql)
// Used by: order.validator, order.service, order.repository
// ---------------------------------------------------------------------------
const ORDER_STATUS = Object.freeze({
  PLACED: 'PLACED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});

// Statuses a CUSTOMER is allowed to cancel from.
// Kept here so future modules (Notifications, Audit) can reference this rule
// without importing order.service.
const CUSTOMER_CANCELLABLE_STATUSES = Object.freeze([
  ORDER_STATUS.PLACED,
  ORDER_STATUS.ACCEPTED,
]);

// ---------------------------------------------------------------------------
// Payment status  (payments.payment_status + orders.payment_status ENUMs)
// Used by: payment.service, payment.repository, order.repository
// ---------------------------------------------------------------------------
const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

// ---------------------------------------------------------------------------
// Payment methods  (payments.payment_method ENUM in schema.sql)
// ---------------------------------------------------------------------------
const PAYMENT_METHOD = Object.freeze({
  CARD: 'CARD',
  UPI: 'UPI',
  WALLET: 'WALLET',
  CASH: 'CASH',
  DUMMY: 'DUMMY',
});

// ---------------------------------------------------------------------------
// Pagination defaults / limits
// Match the Joi validator caps and getPagination() defaults.
// Repositories use these instead of inline magic numbers.
// ---------------------------------------------------------------------------
const PAGINATION = Object.freeze({
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
});

// ---------------------------------------------------------------------------
// Cart constraints  (matches cart.validator Joi rules)
// ---------------------------------------------------------------------------
const CART = Object.freeze({
  MAX_ITEM_QUANTITY: 50,
  MIN_ITEM_QUANTITY: 1,
});

module.exports = {
  ROLES,
  ORDER_STATUS,
  CUSTOMER_CANCELLABLE_STATUSES,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAGINATION,
  CART,
};
