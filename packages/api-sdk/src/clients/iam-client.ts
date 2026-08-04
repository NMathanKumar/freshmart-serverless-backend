import type { ApiClient } from '../http/create-api-client.js';
import type { Role, Permission } from '../contracts/domain.js';

export class IamClient {
  constructor(private readonly client: ApiClient) {}

  async listRoles() {
    const response = await this.client.request<{ data: Role[] }>({
      method: 'GET',
      url: '/iam-service/api/v1/roles'
    });
    return response.data;
  }

  async getRole(roleId: string) {
    const response = await this.client.request<{ data: Role }>({
      method: 'GET',
      url: `/iam-service/api/v1/roles/${roleId}`
    });
    return response.data;
  }

  async listPermissions() {
    const response = await this.client.request<{ data: Permission[] }>({
      method: 'GET',
      url: '/iam-service/api/v1/permissions'
    });
    return response.data;
  }

  async assignPermissionsToRole(roleId: string, permissions: string[]) {
    const response = await this.client.request<{ data: Role }>({
      method: 'PUT',
      url: `/iam-service/api/v1/roles/${roleId}/permissions`,
      data: { permissions }
    });
    return response.data;
  }
}
