import test from 'node:test';
import assert from 'node:assert';
import { IamService } from '../src/services/index.js';
import type { DynamoIamRepository } from '../src/repositories/index.js';

const mockRepo = {
  listRoles: async () => [{ name: 'ADMIN', description: 'Administrator' }],
  listPermissions: async () => [{ key: 'read:users', name: 'Read Users' }],
  replaceRolePermissions: async (roleName: string, permissions: string[]) => ({ success: true })
} as unknown as DynamoIamRepository;

test('IamService', async (t) => {
  const service = new IamService(mockRepo);

  await t.test('listRoles', async () => {
    const roles = await service.listRoles();
    assert.strictEqual(roles.length, 1);
    assert.strictEqual(roles[0].name, 'ADMIN');
  });

  await t.test('listPermissions', async () => {
    const perms = await service.listPermissions();
    assert.strictEqual(perms.length, 1);
    assert.strictEqual(perms[0].key, 'read:users');
  });

  await t.test('updateRolePermissions', async () => {
    const result = await service.updateRolePermissions('ADMIN', { permissions: ['read:users'] });
    assert.strictEqual(result.success, true);
  });
});
