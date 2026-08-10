import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean()
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Please enter your full name.'),
    email: z.string().trim().email('Please enter a valid email address.'),
    phone: z.string().trim().min(7, 'Please enter a valid phone number.'),
    avatarUrl: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters.').regex(/[A-Z]/, 'Add one uppercase letter.').regex(/[0-9]|[^A-Za-z0-9]/, 'Add one number or symbol.'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value, 'You must accept the terms to continue.')
  })
  .refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.')
});

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the complete 6-digit code.')
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
