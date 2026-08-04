import type { DynamoIamRepository } from '../repositories/index.js';
import type { Role, Permission } from '../entities/index.js';
import type { PutRolePermissionsDto } from '../dtos/index.js';

export class IamService {
  constructor(private readonly repository: DynamoIamRepository) {}

  async listRoles(): Promise<Role[]> {
    return this.repository.listRoles();
  }

  async listPermissions(): Promise<Permission[]> {
    return this.repository.listPermissions();
  }

  async updateRolePermissions(roleName: string, input: PutRolePermissionsDto): Promise<{ success: boolean }> {
    await this.repository.replaceRolePermissions(roleName, input.permissions);
    return { success: true };
  }
}
