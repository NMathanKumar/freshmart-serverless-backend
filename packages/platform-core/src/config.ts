import { z, type ZodRawShape } from 'zod';

const baseConfigSchema = z.object({
  NODE_ENV: z.enum(['dev', 'development', 'test', 'staging', 'production']).default('development'),
  APP_ENV: z.string().min(1).default('development'),
  AWS_REGION: z.string().min(1),
  CORS_ALLOWED_ORIGINS: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

export const serviceConfigSchema = (shape: ZodRawShape = {}) => baseConfigSchema.extend(shape);

export const loadConfig = <TShape extends ZodRawShape>(
  serviceName: string,
  shape: TShape,
  environment: NodeJS.ProcessEnv = process.env
) => {
  const schema = serviceConfigSchema(shape);
  const parsed = schema.safeParse(environment);

  if (!parsed.success) {
    const details = parsed.error.flatten();
    throw new Error(`Configuration validation failed for ${serviceName}: ${JSON.stringify(details)}`);
  }

  return parsed.data as z.infer<typeof schema>;
};

export const optionalUrlArray = (value: string | undefined): string[] =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

export type ServiceConfigSchema = ReturnType<typeof serviceConfigSchema>;
