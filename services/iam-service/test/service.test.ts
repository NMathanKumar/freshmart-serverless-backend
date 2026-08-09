import test from 'node:test';
import assert from 'node:assert';
import { IamService } from '../src/services/index.js';
import type { DynamoIamRepository } from '../src/repositories/index.js';
import type { Role, Permission } from '../src/entities/index.js';

const mockRoles: Role[] = [
  { roleId: 'role-1', roleName: 'admin', permissions: ['*'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];
const mockPermissions: Permission[] = [
  { permissionId: 'perm-1', action: 'read', resource: '*', description: 'Read all' }
];

const mockRepo = {
  listRoles: async () => mockRoles,
  listPermissions: async () => mockPermissions,
  replaceRolePermissions: async (roleName: string, permissions: string[]) => {
    const role = mockRoles.find(r => r.roleName === roleName);
    if (role) role.permissions = permissions;
  }
} as unknown as DynamoIamRepository;

test('IamService', async (t) => {
  const service = new IamService(mockRepo);

  await t.test('listRoles', async () => {
    const roles = await service.listRoles();
    assert.strictEqual(roles.length, 1);
    assert.strictEqual(roles[0].roleName, 'admin');
  });

  await t.test('listPermissions', async () => {
    const perms = await service.listPermissions();
    assert.strictEqual(perms.length, 1);
    assert.strictEqual(perms[0].action, 'read');
  });

  await t.test('updateRolePermissions', async () => {
    const res = await service.updateRolePermissions('admin', { permissions: ['read', 'write'] });
    assert.strictEqual(res.success, true);
    assert.deepStrictEqual(mockRoles[0].permissions, ['read', 'write']);
  });
});

