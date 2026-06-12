import { z } from 'zod';
import { APPLICATION_PIPELINE_STAGES } from '@/lib/workflow/stages';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const studentFormSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(2).max(250),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(5).max(32).optional().or(z.literal('')),
  source: z.enum(['organic', 'paid_ads', 'referral', 'website', 'walk_in', 'whatsapp', 'import', 'other']),
  preferredCountry: z.string().max(120).optional().or(z.literal('')),
  branchId: z.string().uuid().optional().or(z.literal('')),
  assignedCounsellorId: z.string().uuid().optional().or(z.literal('')),
  leadScore: z.coerce.number().int().min(0).max(100).default(0),
  notes: z.string().optional().or(z.literal('')),
  tags: z.array(z.string().min(1)).default([]),
});

export const applicationFormSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  universityId: z.string().uuid(),
  programId: z.string().uuid(),
  applicationNumber: z.string().min(1).max(80),
  stage: z.enum(APPLICATION_PIPELINE_STAGES),
  intakeTerm: z.string().optional().or(z.literal('')),
  intakeYear: z.coerce.number().int().min(2000).max(2100).optional(),
  feeAmount: z.coerce.number().min(0).optional(),
  notes: z.string().optional().or(z.literal('')),
  assignedCounsellorId: z.string().uuid().optional().or(z.literal('')),
  branchId: z.string().uuid().optional().or(z.literal('')),
});

export const taskFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(250),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['open', 'in_progress', 'blocked', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueAt: z.string().datetime().optional().or(z.literal('')),
  reminderAt: z.string().datetime().optional().or(z.literal('')),
  assignedUserId: z.string().uuid().optional().or(z.literal('')),
  studentId: z.string().uuid().optional().or(z.literal('')),
  applicationId: z.string().uuid().optional().or(z.literal('')),
});

export const inboxFilterSchema = z.object({
  filter: z.enum(['all', 'new', 'due_today', 'overdue', 'unreachable', 'stale']).default('all'),
  sort: z.enum(['urgency', 'recent', 'oldest']).default('urgency'),
});

export const notificationFilterSchema = z.object({
  unreadOnly: z.coerce.boolean().default(false),
});

export const auditLogFilterSchema = z.object({
  entityName: z.string().trim().optional(),
  actorUserId: z.string().uuid().optional(),
});
