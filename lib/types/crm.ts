import type { ApplicationStage, InboxFilter, StudentStatus, TaskViewMode } from '@/lib/constants/crm';

export interface TenantContext {
  tenantId: string;
  role: 'admin' | 'manager' | 'counsellor';
  userId: string;
}

export interface StudentRecord {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  preferred_country: string | null;
  nationality: string | null;
  source: string;
  status: StudentStatus;
  lead_score: number;
  created_at: string;
  updated_at: string;
  last_contacted_at: string | null;
  assigned_counsellor_id: string | null;
  notes: string | null;
}

export interface ApplicationRecord {
  id: string;
  tenant_id: string;
  student_id: string;
  university_id: string;
  program_id: string;
  application_number: string;
  status: ApplicationStage | string;
  created_at: string;
  updated_at: string;
  assigned_counsellor_id: string | null;
  notes: string | null;
  rejection_reason: string | null;
  intake_term: string | null;
  intake_year: number | null;
}

export interface TaskRecord {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_at: string | null;
  completed_at: string | null;
  reminder_at: string | null;
  assigned_user_id: string | null;
  created_by: string | null;
  student_id: string | null;
  application_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  tenant_id: string;
  user_id: string;
  type: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  title: string;
  body: string | null;
  link_url: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRecord {
  id: string;
  tenant_id: string;
  actor_user_id: string | null;
  entity_name: string;
  entity_id: string | null;
  action: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InboxItem {
  id: string;
  title: string;
  type: 'student' | 'task' | 'application' | 'notification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  filter: InboxFilter;
  due_at: string | null;
  created_at: string;
  status: string;
  assignee_name: string | null;
  student_name: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TaskViewState {
  mode: TaskViewMode;
  selectedDate: string;
}
