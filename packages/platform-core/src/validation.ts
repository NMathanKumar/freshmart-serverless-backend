import { DomainError } from './errors.js';
import type { ZodTypeAny, output } from 'zod';

export const validate = <TSchema extends ZodTypeAny>(schema: TSchema, payload: unknown): output<TSchema> => {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new DomainError('Validation failed.', 422, parsed.error.flatten());
  }
  return parsed.data;
};
