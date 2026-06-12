import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getApplicationStage, getDatabaseStatusForStage, type ApplicationPipelineStage } from '@/lib/workflow/stages';

export type PageResult<T> = {
  items: T[];
  count: number;
  page: number;
  pageSize: number;
};

function getOffset(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}

function normalizeSearch(search?: string) {
  return search?.trim() ?? '';
}

export async function listStudents(params: {
  tenantId: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  const admin = createSupabaseAdminClient();
  const offset = getOffset(params.page, params.pageSize);
  const search = normalizeSearch(params.search);

  let query = admin
    .from('students')
    .select('*', { count: 'exact' })
    .eq('tenant_id', params.tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + params.pageSize - 1);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { items: (data ?? []) as any[], count: count ?? 0, page: params.page, pageSize: params.pageSize } satisfies PageResult<any>;
}

export async function upsertStudent(input: {
  tenantId: string;
  student: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const payload = { ...input.student, tenant_id: input.tenantId };
  const { data, error } = await admin.from('students').upsert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteStudent(params: { tenantId: string; studentId: string }) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('students')
    .update({ deleted_at: new Date().toISOString(), archived_at: new Date().toISOString() })
    .eq('tenant_id', params.tenantId)
    .eq('id', params.studentId);
  if (error) throw error;
}

export async function listApplications(params: {
  tenantId: string;
  page: number;
  pageSize: number;
  search?: string;
  stage?: ApplicationPipelineStage;
}) {
  const admin = createSupabaseAdminClient();
  const offset = getOffset(params.page, params.pageSize);
  const search = normalizeSearch(params.search);

  let query = admin
    .from('applications')
    .select('*, students(full_name, email), universities(name), programs(name)', { count: 'exact' })
    .eq('tenant_id', params.tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + params.pageSize - 1);

  if (search) {
    query = query.or(`application_number.ilike.%${search}%,notes.ilike.%${search}%`);
  }

  if (params.stage) {
    query = query.eq('status', getDatabaseStatusForStage(params.stage));
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { items: (data ?? []).map((item) => ({ ...item, stage: getApplicationStage(item.status) })), count: count ?? 0, page: params.page, pageSize: params.pageSize } satisfies PageResult<any>;
}

export async function upsertApplication(input: {
  tenantId: string;
  application: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const stage = input.application.stage as ApplicationPipelineStage | undefined;
  const payload = {
    ...input.application,
    tenant_id: input.tenantId,
    status: stage ? getDatabaseStatusForStage(stage) : input.application.status,
  };
  const { data, error } = await admin.from('applications').upsert(payload).select('*').single();
  if (error) throw error;
  return { ...data, stage: getApplicationStage(data.status) };
}

export async function moveApplicationStage(params: {
  tenantId: string;
  applicationId: string;
  stage: ApplicationPipelineStage;
}) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('applications')
    .update({ status: getDatabaseStatusForStage(params.stage) })
    .eq('tenant_id', params.tenantId)
    .eq('id', params.applicationId)
    .select('*')
    .single();
  if (error) throw error;
  return { ...data, stage: getApplicationStage(data.status) };
}

export async function deleteApplication(params: { tenantId: string; applicationId: string }) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('applications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', params.tenantId)
    .eq('id', params.applicationId);
  if (error) throw error;
}

export async function listTasks(params: {
  tenantId: string;
  page: number;
  pageSize: number;
  search?: string;
  scope?: 'all' | 'my' | 'team';
  assigneeId?: string;
}) {
  const admin = createSupabaseAdminClient();
  const offset = getOffset(params.page, params.pageSize);
  const search = normalizeSearch(params.search);

  let query = admin
    .from('tasks')
    .select('*, students(full_name), applications(application_number), users:users!tasks_assigned_user_id_fkey(full_name)', { count: 'exact' })
    .eq('tenant_id', params.tenantId)
    .is('deleted_at', null)
    .order('due_at', { ascending: true, nullsFirst: false })
    .range(offset, offset + params.pageSize - 1);

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (params.scope === 'my' && params.assigneeId) {
    query = query.eq('assigned_user_id', params.assigneeId);
  }

  if (params.scope === 'team' && params.assigneeId) {
    query = query.neq('assigned_user_id', params.assigneeId);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { items: data ?? [], count: count ?? 0, page: params.page, pageSize: params.pageSize } satisfies PageResult<any>;
}

export async function upsertTask(input: { tenantId: string; task: Record<string, unknown> }) {
  const admin = createSupabaseAdminClient();
  const payload = { ...input.task, tenant_id: input.tenantId };
  const { data, error } = await admin.from('tasks').upsert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteTask(params: { tenantId: string; taskId: string }) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', params.tenantId)
    .eq('id', params.taskId);
  if (error) throw error;
}

export async function listNotifications(params: { tenantId: string; userId: string; page: number; pageSize: number; unreadOnly?: boolean }) {
  const admin = createSupabaseAdminClient();
  const offset = getOffset(params.page, params.pageSize);
  let query = admin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('tenant_id', params.tenantId)
    .eq('user_id', params.userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + params.pageSize - 1);

  if (params.unreadOnly) {
    query = query.is('read_at', null);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { items: data ?? [], count: count ?? 0, page: params.page, pageSize: params.pageSize } satisfies PageResult<any>;
}

export async function markNotificationRead(params: { tenantId: string; notificationId: string }) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('notifications')
    .update({ read_at: new Date().toISOString(), status: 'read' })
    .eq('tenant_id', params.tenantId)
    .eq('id', params.notificationId);
  if (error) throw error;
}

export async function listAuditLogs(params: { tenantId: string; page: number; pageSize: number; entityName?: string; actorUserId?: string }) {
  const admin = createSupabaseAdminClient();
  const offset = getOffset(params.page, params.pageSize);
  let query = admin
    .from('audit_logs')
    .select('*, users(full_name, email)', { count: 'exact' })
    .eq('tenant_id', params.tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + params.pageSize - 1);

  if (params.entityName) {
    query = query.eq('entity_name', params.entityName);
  }

  if (params.actorUserId) {
    query = query.eq('actor_user_id', params.actorUserId);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { items: data ?? [], count: count ?? 0, page: params.page, pageSize: params.pageSize } satisfies PageResult<any>;
}

export async function createActivityLog(params: {
  tenantId: string;
  userId: string;
  activityType: string;
  subject: string;
  description?: string;
  studentId?: string;
  applicationId?: string;
  metadata?: Record<string, any>;
}) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('activity_logs')
    .insert({
      tenant_id: params.tenantId,
      user_id: params.userId,
      activity_type: params.activityType,
      subject: params.subject,
      description: params.description,
      student_id: params.studentId,
      application_id: params.applicationId,
      metadata: params.metadata || {},
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateStudentCounsellor(params: {
  tenantId: string;
  studentId: string;
  counsellorId: string | null;
}) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('students')
    .update({ assigned_counsellor_id: params.counsellorId })
    .eq('tenant_id', params.tenantId)
    .eq('id', params.studentId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
