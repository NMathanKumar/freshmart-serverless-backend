const { describe, it } = require('node:test');
const assert = require('node:assert');
const registry = require('../src/event-router/registry');
const { routeEvent } = require('../src/event-router/router');

describe('Notification Service Event Router & Registry', () => {
  it('registers handlers in Map registry without switch statements', () => {
    const handler = registry.getHandler('CustomerRegistered.v1');
    assert.ok(handler);
    assert.strictEqual(typeof handler, 'function');
  });

  it('supports versioned and dot-notation detailType mappings', () => {
    assert.ok(registry.getHandler('UserLoggedIn.v1'));
    assert.ok(registry.getHandler('customer.logged_in'));
    assert.ok(registry.getHandler('OrderPlaced.v1'));
    assert.ok(registry.getHandler('order.placed'));
  });

  it('gracefully handles unhandled events without crashing', async () => {
    const event = {
      'detail-type': 'unknown.event.type',
      detail: {},
      id: 'evt_test_123',
    };

    const result = await routeEvent(event, {});
    assert.strictEqual(result.status, 'IGNORED_UNHANDLED_EVENT');
  });
});
