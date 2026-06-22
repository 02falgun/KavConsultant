"use server";

import { revalidatePath } from 'next/cache';
import { createOrUpdateStudent, createOrUpdateApplication, createOrUpdateTask, exportStudentsCsv, importStudentsCsv, removeApplication, removeStudent, removeTask, readNotification, updateApplicationStage, logCrmActivity, assignStudentCounsellor } from '@/lib/services/crm';
import { applicationFormSchema, studentFormSchema, taskFormSchema } from '@/lib/validations/workflow';
import type { ApplicationPipelineStage } from '@/lib/workflow/stages';

export type CrmActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function cleanEmptyStrings(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = { ...obj };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === '') {
      cleaned[key] = null;
    }
  }
  if (cleaned.id === null || cleaned.id === '') {
    delete cleaned.id;
  }
  return cleaned;
}

export async function saveStudentAction(input: unknown): Promise<CrmActionResult> {
  const cleaned = cleanEmptyStrings(input);
  const parsed = studentFormSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid student data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = await createOrUpdateStudent({
    id: parsed.data.id,
    full_name: parsed.data.fullName,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    source: parsed.data.source,
    preferred_country: parsed.data.preferredCountry || null,
    branch_id: parsed.data.branchId || null,
    assigned_counsellor_id: parsed.data.assignedCounsellorId || null,
    lead_score: parsed.data.leadScore,
    notes: parsed.data.notes || null,
    tags: parsed.data.tags,
  });

  revalidatePath('/students');
  return { ok: true, data };
}

export async function deleteStudentAction(studentId: string): Promise<CrmActionResult> {
  await removeStudent(studentId);
  revalidatePath('/students');
  return { ok: true };
}

export async function importStudentsAction(csvText: string): Promise<CrmActionResult<{ imported: number }>> {
  const imported = await importStudentsCsv(csvText);
  revalidatePath('/students');
  return { ok: true, data: { imported: imported.length } };
}

export async function exportStudentsAction(): Promise<CrmActionResult<{ csv: string }>> {
  const csv = await exportStudentsCsv({});
  return { ok: true, data: { csv } };
}

export async function saveApplicationAction(input: unknown): Promise<CrmActionResult> {
  const cleaned = cleanEmptyStrings(input);
  const parsed = applicationFormSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid application data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await createOrUpdateApplication({
      id: parsed.data.id,
      student_id: parsed.data.studentId,
      university_id: parsed.data.universityId,
      program_id: parsed.data.programId,
      application_number: parsed.data.applicationNumber,
      stage: parsed.data.stage,
      intake_term: parsed.data.intakeTerm || null,
      intake_year: parsed.data.intakeYear || null,
      fee_amount: parsed.data.feeAmount || null,
      notes: parsed.data.notes || null,
      assigned_counsellor_id: parsed.data.assignedCounsellorId || null,
      branch_id: parsed.data.branchId || null,
    });

    revalidatePath('/applications');
    return { ok: true, data };
  } catch (error: any) {
    console.error('Error saving application:', error);
    return { ok: false, error: error.message || 'Failed to save application to database.' };
  }
}

export async function updateApplicationStageAction(applicationId: string, stage: ApplicationPipelineStage): Promise<CrmActionResult> {
  await updateApplicationStage(applicationId, stage);
  revalidatePath('/applications');
  return { ok: true };
}

export async function deleteApplicationAction(applicationId: string): Promise<CrmActionResult> {
  await removeApplication(applicationId);
  revalidatePath('/applications');
  return { ok: true };
}

export async function saveTaskAction(input: unknown): Promise<CrmActionResult> {
  const cleaned = cleanEmptyStrings(input);
  const parsed = taskFormSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid task data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = await createOrUpdateTask({
    id: parsed.data.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_at: parsed.data.dueAt || null,
    reminder_at: parsed.data.reminderAt || null,
    assigned_user_id: parsed.data.assignedUserId || null,
    student_id: parsed.data.studentId || null,
    application_id: parsed.data.applicationId || null,
  });

  revalidatePath('/tasks');
  return { ok: true, data };
}

export async function deleteTaskAction(taskId: string): Promise<CrmActionResult> {
  await removeTask(taskId);
  revalidatePath('/tasks');
  return { ok: true };
}

export async function readNotificationAction(notificationId: string): Promise<CrmActionResult> {
  await readNotification(notificationId);
  revalidatePath('/notifications');
  return { ok: true };
}

export async function logCrmActivityAction(params: {
  activityType: string;
  subject: string;
  description?: string;
  studentId?: string;
  applicationId?: string;
  metadata?: Record<string, any>;
}): Promise<CrmActionResult> {
  const data = await logCrmActivity(params);
  revalidatePath('/inbox');
  revalidatePath('/students');
  revalidatePath('/applications');
  return { ok: true, data };
}

export async function assignStudentCounsellorAction(params: {
  studentId: string;
  counsellorId: string | null;
}): Promise<CrmActionResult> {
  const data = await assignStudentCounsellor(params);
  revalidatePath('/inbox');
  revalidatePath('/students');
  revalidatePath('/applications');
  return { ok: true, data };
}
