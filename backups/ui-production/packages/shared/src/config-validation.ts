import { z } from 'zod';

export const customerEnvSchema = z.object({
  VITE_CUSTOMER_API_BASE_URL: z.string().url(),
  VITE_AUTH_API_BASE_URL: z.string().url(),
  VITE_THEME_DEFAULT: z.enum(['light', 'dark']).default('light'),
  VITE_COGNITO_DOMAIN: z.string().url().optional(),
  VITE_COGNITO_CLIENT_ID: z.string().optional(),
  VITE_OAUTH_REDIRECT_URI: z.string().url().optional(),
});

export const adminEnvSchema = z.object({
  VITE_ADMIN_API_BASE_URL: z.string().url(),
  VITE_AUTH_API_BASE_URL: z.string().url(),
  VITE_THEME_DEFAULT: z.enum(['light', 'dark']).default('light'),
  VITE_COGNITO_DOMAIN: z.string().url().optional(),
  VITE_COGNITO_CLIENT_ID: z.string().optional(),
  VITE_OAUTH_REDIRECT_URI: z.string().url().optional(),
});

export const loadEnvironment = <TSchema extends z.ZodTypeAny>(schema: TSchema, environment: Record<string, unknown>) => {
  const parsed = schema.safeParse(environment);
  if (!parsed.success) {
    throw new Error(`Frontend environment validation failed: ${JSON.stringify(parsed.error.flatten())}`);
  }

  return parsed.data;
};
