import { createSupabaseServerClient } from '@/lib/supabase/server';
import { parseCsv, toCsv } from '@/lib/utils/csv';
import { CRM_EXPORT_PAGE_SIZE } from '@/lib/constants/crm';
import { getWorkspaceContext, requireWorkspaceContext } from '@/lib/auth/session';
import {
  deleteApplication,
  deleteStudent,
  deleteTask,
  listApplications,
  listAuditLogs,
  listNotifications,
  listStudents,
  listTasks,
  markNotificationRead,
  moveApplicationStage,
  upsertApplication,
  upsertStudent,
  upsertTask,
  createActivityLog,
  updateStudentCounsellor,
} from '@/lib/repositories/crm';
import type { ApplicationPipelineStage } from '@/lib/workflow/stages';
import type { InboxFilter } from '@/lib/constants/crm';

export async function getStudentsPage(params: { page: number; pageSize: number; search?: string; status?: string }) {
  const context = await requireWorkspaceContext();
  return listStudents({ tenantId: context.tenantId, ...params });
}

export async function createOrUpdateStudent(input: Record<string, unknown>) {
  const context = await requireWorkspaceContext();
  return upsertStudent({ tenantId: context.tenantId, student: input });
}

export async function removeStudent(studentId: string) {
  const context = await requireWorkspaceContext();
  return deleteStudent({ tenantId: context.tenantId, studentId });
}

export async function exportStudentsCsv(params: { search?: string; status?: string }) {
  const context = await requireWorkspaceContext();
  const page = await listStudents({ tenantId: context.tenantId, page: 1, pageSize: CRM_EXPORT_PAGE_SIZE, ...params });
  return toCsv(
    page.items.map((student: any) => ({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      source: student.source,
      status: student.status,
      lead_score: student.lead_score,
      preferred_country: student.preferred_country,
      notes: student.notes,
    })),
    ['full_name', 'email', 'phone', 'source', 'status', 'lead_score', 'preferred_country', 'notes']
  );
}

export async function importStudentsCsv(csvText: string) {
  const context = await requireWorkspaceContext();
  const rows = parseCsv(csvText);
  const imported = [] as unknown[];

  for (const row of rows) {
    imported.push(
      await upsertStudent({
        tenantId: context.tenantId,
        student: {
          full_name: row.full_name ?? row.fullName,
          email: row.email || null,
          phone: row.phone || null,
          source: row.source || 'import',
          status: row.status || 'new',
          lead_score: Number(row.lead_score ?? row.leadScore ?? 0),
          preferred_country: row.preferred_country ?? row.preferredCountry ?? null,
          notes: row.notes || null,
        },
      })
    );
  }

  return imported;
}

export async function getApplicationsPage(params: { page: number; pageSize: number; search?: string; stage?: ApplicationPipelineStage }) {
  const context = await requireWorkspaceContext();
  return listApplications({ tenantId: context.tenantId, ...params });
}

export async function createOrUpdateApplication(input: Record<string, unknown>) {
  const context = await requireWorkspaceContext();
  return upsertApplication({ tenantId: context.tenantId, application: input });
}

export async function updateApplicationStage(applicationId: string, stage: ApplicationPipelineStage) {
  const context = await requireWorkspaceContext();
  return moveApplicationStage({ tenantId: context.tenantId, applicationId, stage });
}

export async function removeApplication(applicationId: string) {
  const context = await requireWorkspaceContext();
  return deleteApplication({ tenantId: context.tenantId, applicationId });
}

export async function getInboxPage(params: { page: number; pageSize: number; filter?: InboxFilter }) {
  const context = await getWorkspaceContext();
  if (!context) {
    return { items: [], count: 0, page: params.page, pageSize: params.pageSize };
  }

  const [tasks, students] = await Promise.all([
    listTasks({ tenantId: context.tenantId, page: 1, pageSize: 100, scope: 'all' }),
    listStudents({ tenantId: context.tenantId, page: 1, pageSize: 100 }),
  ]);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const items = [
    ...tasks.items.map((task: any) => ({
      id: task.id,
      title: task.title,
      type: 'task' as const,
      priority: task.priority,
      filter: task.due_at ? (task.due_at.slice(0, 10) === today ? 'due_today' : new Date(task.due_at) < now ? 'overdue' : 'all') : 'all',
      due_at: task.due_at,
      created_at: task.created_at,
      status: task.status,
      assignee_name: task.users?.full_name ?? null,
      student_name: task.students?.full_name ?? null,
    })),
    ...students.items
      .filter((student: any) => student.status === 'new' || student.status === 'contacted')
      .map((student: any) => ({
        id: student.id,
        title: student.full_name,
        type: 'student' as const,
        priority: student.lead_score > 70 ? 'urgent' : student.lead_score > 40 ? 'high' : 'medium',
        filter: student.last_contacted_at ? 'stale' : 'unreachable',
        due_at: student.last_contacted_at,
        created_at: student.created_at,
        status: student.status,
        assignee_name: null,
        student_name: student.full_name,
      })),
  ];

  const filter = params.filter ?? 'all';
  const filtered = filter === 'all' ? items : items.filter((item) => item.filter === filter || item.status === filter);

  return {
    items: filtered.sort((left, right) => {
      const weights = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
      return weights[left.priority as keyof typeof weights] - weights[right.priority as keyof typeof weights];
    }),
    count: filtered.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getTasksPage(params: { page: number; pageSize: number; search?: string; scope?: 'all' | 'my' | 'team'; assigneeId?: string }) {
  const context = await requireWorkspaceContext();
  return listTasks({ tenantId: context.tenantId, ...params });
}

export async function createOrUpdateTask(input: Record<string, unknown>) {
  const context = await requireWorkspaceContext();
  return upsertTask({ tenantId: context.tenantId, task: input });
}

export async function removeTask(taskId: string) {
  const context = await requireWorkspaceContext();
  return deleteTask({ tenantId: context.tenantId, taskId });
}

export async function getNotificationsPage(params: { page: number; pageSize: number; unreadOnly?: boolean }) {
  const context = await requireWorkspaceContext();
  return listNotifications({ tenantId: context.tenantId, userId: context.userId, ...params });
}

export async function readNotification(notificationId: string) {
  const context = await requireWorkspaceContext();
  return markNotificationRead({ tenantId: context.tenantId, notificationId });
}

export async function getAuditLogsPage(params: { page: number; pageSize: number; entityName?: string; actorUserId?: string }) {
  const context = await requireWorkspaceContext();
  return listAuditLogs({ tenantId: context.tenantId, ...params });
}

export async function logCrmActivity(params: {
  activityType: string;
  subject: string;
  description?: string;
  studentId?: string;
  applicationId?: string;
  metadata?: Record<string, any>;
}) {
  const context = await requireWorkspaceContext();
  return createActivityLog({
    tenantId: context.tenantId,
    userId: context.userId,
    ...params
  });
}

export async function assignStudentCounsellor(params: {
  studentId: string;
  counsellorId: string | null;
}) {
  const context = await requireWorkspaceContext();
  return updateStudentCounsellor({
    tenantId: context.tenantId,
    ...params
  });
}
