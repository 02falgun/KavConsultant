"use server";

import { revalidatePath } from 'next/cache';
import { createOrUpdateStudent, createOrUpdateApplication, createOrUpdateTask, exportStudentsCsv, importStudentsCsv, removeApplication, removeStudent, removeTask, readNotification, updateApplicationStage, logCrmActivity, assignStudentCounsellor, createOrUpdateUniversity, removeUniversity, createOrUpdateProgram, removeProgram } from '@/lib/services/crm';
import { applicationFormSchema, studentFormSchema, taskFormSchema, uuidSchema, updateApplicationStageSchema, logActivitySchema, assignCounsellorSchema, universityFormSchema, programFormSchema } from '@/lib/validations/workflow';
import type { ApplicationPipelineStage } from '@/lib/workflow/stages';

export type CrmActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function slugifyName(name: string) {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'university'}-${suffix}`;
}

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
  const parsed = uuidSchema.safeParse(studentId);
  if (!parsed.success) return { ok: false, error: 'Invalid Student ID format' };

  try {
    await removeStudent(parsed.data);
    revalidatePath('/students');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to delete student.' };
  }
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
  const parsed = updateApplicationStageSchema.safeParse({ id: applicationId, stage });
  if (!parsed.success) return { ok: false, error: 'Invalid stage update parameters.' };

  try {
    await updateApplicationStage(parsed.data.id, parsed.data.stage);
    revalidatePath('/applications');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to update application stage.' };
  }
}

export async function deleteApplicationAction(applicationId: string): Promise<CrmActionResult> {
  const parsed = uuidSchema.safeParse(applicationId);
  if (!parsed.success) return { ok: false, error: 'Invalid Application ID format' };

  try {
    await removeApplication(parsed.data);
    revalidatePath('/applications');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to delete application.' };
  }
}

export async function saveTaskAction(input: unknown): Promise<CrmActionResult> {
  const cleaned = cleanEmptyStrings(input);
  const parsed = taskFormSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid task data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
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
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to save task.' };
  }
}

export async function deleteTaskAction(taskId: string): Promise<CrmActionResult> {
  const parsed = uuidSchema.safeParse(taskId);
  if (!parsed.success) return { ok: false, error: 'Invalid Task ID format' };

  try {
    await removeTask(parsed.data);
    revalidatePath('/tasks');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to delete task.' };
  }
}

export async function readNotificationAction(notificationId: string): Promise<CrmActionResult> {
  const parsed = uuidSchema.safeParse(notificationId);
  if (!parsed.success) return { ok: false, error: 'Invalid Notification ID format' };

  try {
    await readNotification(parsed.data);
    revalidatePath('/notifications');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to read notification.' };
  }
}

export async function logCrmActivityAction(params: {
  activityType: string;
  subject: string;
  description?: string;
  studentId?: string;
  applicationId?: string;
  metadata?: Record<string, any>;
}): Promise<CrmActionResult> {
  const cleaned = cleanEmptyStrings(params);
  const parsed = logActivitySchema.safeParse(cleaned);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid activity details', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await logCrmActivity({
      activityType: parsed.data.activityType,
      subject: parsed.data.subject,
      description: parsed.data.description || undefined,
      studentId: parsed.data.studentId || undefined,
      applicationId: parsed.data.applicationId || undefined,
      metadata: parsed.data.metadata || undefined,
    });
    revalidatePath('/inbox');
    revalidatePath('/students');
    revalidatePath('/applications');
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to log activity.' };
  }
}

export async function saveUniversityAction(input: unknown): Promise<CrmActionResult> {
  const cleaned = cleanEmptyStrings(input);
  const parsed = universityFormSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid university data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const base = {
      name: parsed.data.name,
      country: parsed.data.country,
      city: parsed.data.city || null,
      website: parsed.data.website || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      type: parsed.data.type,
      ranking: parsed.data.ranking ?? null,
      description: parsed.data.description || null,
    };

    // On create, generate a unique slug from the name. On update, leave the
    // existing slug untouched by not including it in the payload.
    const payload = parsed.data.id
      ? { id: parsed.data.id, ...base }
      : { ...base, slug: slugifyName(parsed.data.name) };

    const data = await createOrUpdateUniversity(payload);
    revalidatePath('/universities');
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to save university.' };
  }
}

export async function deleteUniversityAction(universityId: string): Promise<CrmActionResult> {
  const parsed = uuidSchema.safeParse(universityId);
  if (!parsed.success) return { ok: false, error: 'Invalid University ID format' };

  try {
    await removeUniversity(parsed.data);
    revalidatePath('/universities');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to delete university.' };
  }
}

export async function saveProgramAction(input: unknown): Promise<CrmActionResult> {
  const cleaned = cleanEmptyStrings(input);
  const parsed = programFormSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid program data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const fee = parsed.data.tuitionFee ?? null;
    const base = {
      university_id: parsed.data.universityId,
      name: parsed.data.name,
      degree_level: parsed.data.degreeLevel || null,
      field_of_study: parsed.data.fieldOfStudy || null,
      duration_months: parsed.data.durationMonths ?? null,
      tuition_fee_min: fee,
      tuition_fee_max: fee,
    };

    // On create, generate a unique code from the name. On update, leave it untouched.
    const payload = parsed.data.id
      ? { id: parsed.data.id, ...base }
      : { ...base, code: slugifyName(parsed.data.name) };

    const data = await createOrUpdateProgram(payload);
    revalidatePath('/programs');
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to save program.' };
  }
}

export async function deleteProgramAction(programId: string): Promise<CrmActionResult> {
  const parsed = uuidSchema.safeParse(programId);
  if (!parsed.success) return { ok: false, error: 'Invalid Program ID format' };

  try {
    await removeProgram(parsed.data);
    revalidatePath('/programs');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to delete program.' };
  }
}

export async function assignStudentCounsellorAction(params: {
  studentId: string;
  counsellorId: string | null;
}): Promise<CrmActionResult> {
  const cleaned = cleanEmptyStrings(params);
  const parsed = assignCounsellorSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid assignment parameters', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await assignStudentCounsellor({
      studentId: parsed.data.studentId,
      counsellorId: parsed.data.counsellorId || null,
    });
    revalidatePath('/inbox');
    revalidatePath('/students');
    revalidatePath('/applications');
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to assign counsellor.' };
  }
}
