import { z } from 'zod';

export const putRolePermissionsSchema = z.object({
  permissions: z.array(z.string().min(1)).min(1)
});
