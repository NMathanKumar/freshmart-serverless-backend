import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const localsPath = path.resolve(process.cwd(), 'terraform/environments/dev/locals.tf');
const localsSource = readFileSync(localsPath, 'utf8');

const protectedRouteBlocks = [
  'auth_me',
  'auth_verify_email_request',
  'auth_verify_email_confirm',
  'auth_change_password',
  'products_create',
  'products_update',
  'products_delete',
  'user_profile_get',
  'user_profile_put',
  'user_addresses_post',
  'orders_list',
  'orders_create',
  'orders_get',
  'orders_cancel',
  'payments_create',
  'payments_get',
  'admin_dashboard'
];

const getBlock = (name: string) => {
  const match = localsSource.match(new RegExp(`${name}\\s*=\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'm'));
  return match?.[1] ?? '';
};

test('terraform environments/dev protects every live private route with JWT authorizers', () => {
  for (const routeName of protectedRouteBlocks) {
    const block = getBlock(routeName);
    assert.notEqual(block, '', `${routeName} block is missing from locals.tf`);
    assert.match(
      block,
      /authorization_type\s*=\s*"JWT"/,
      `${routeName} must set authorization_type = "JWT"`
    );
  }
});

test('terraform environments/dev contains the live user profile routes', () => {
  assert.match(localsSource, /path\s*=\s*"\/users\/profile"/);
  assert.match(localsSource, /path\s*=\s*"\/users\/addresses"/);
});
