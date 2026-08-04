import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { DomainError, handleRouteFailure, validate } from '../src/index.js';

test('validate returns parsed values for valid payloads', () => {
  const schema = z.object({ id: z.string().uuid() });
  const value = validate(schema, { id: '11111111-1111-4111-8111-111111111111' });
  assert.equal(value.id, '11111111-1111-4111-8111-111111111111');
});

test('validate throws a domain error for invalid payloads', () => {
  const schema = z.object({ id: z.string().uuid() });
  assert.throws(() => validate(schema, { id: 'invalid' }), DomainError);
});

test('handleRouteFailure returns RFC7807 problem details for domain errors', () => {
  const logger = {
    info() {},
    warn() {},
    error() {}
  };

  const response = handleRouteFailure(
    logger,
    new DomainError('Validation failed.', 422, { field: 'email' }),
    { path: '/api/v1/catalog/products', requestId: 'req-1' }
  );

  assert.equal(response.statusCode, 422);
  assert.equal(response.headers?.['content-type'], 'application/problem+json');
  assert.deepEqual(response.body, {
    type: 'about:blank',
    title: 'Unprocessable Entity',
    status: 422,
    detail: 'Validation failed.',
    instance: '/api/v1/catalog/products',
    requestId: 'req-1',
    errors: { field: 'email' }
  });
});
