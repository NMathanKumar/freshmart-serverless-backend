import { jsonResponse, validate } from '@freshmart/platform-core';
import { putRolePermissionsSchema } from '../validators/index.js';
import type { IamService } from '../services/index.js';

export class IamController {
  constructor(private readonly service: IamService) {}

  async listRoles() {
    const items = await this.service.listRoles();
    return jsonResponse(200, { items });
  }

  async listPermissions() {
    const items = await this.service.listPermissions();
    return jsonResponse(200, { items });
  }

  async updateRolePermissions(roleName: string, body: Record<string, unknown>) {
    const input = validate(putRolePermissionsSchema, body);
    const result = await this.service.updateRolePermissions(roleName, input);
    return jsonResponse(200, result);
  }
}

export const createController = (service: IamService) => new IamController(service);
