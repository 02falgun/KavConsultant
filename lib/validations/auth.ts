import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(2).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  workspaceName: z.string().min(2).max(200),
  workspaceSlug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const magicLinkSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const inviteMemberSchema = z.object({
  tenantId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'counsellor']),
});

export const acceptInviteSchema = z.object({
  invitationId: z.string().uuid(),
  token: z.string().min(8),
  password: z.string().min(8).max(128).optional(),
});

export const resendInviteSchema = z.object({
  invitationId: z.string().uuid(),
});

export const cancelInviteSchema = z.object({
  invitationId: z.string().uuid(),
});
