-- KavConsultant CRM remaining tables and policies

-- 1. Lead Forms
create table if not exists public.lead_forms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  name text not null,
  title text,
  description text,
  fields jsonb not null default '[]'::jsonb,
  success_message text,
  redirect_url text,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint lead_forms_name_length check (char_length(name) between 2 and 200)
);

create index if not exists idx_lead_forms_tenant_active on public.lead_forms (tenant_id, is_active);
create index if not exists idx_lead_forms_deleted_at on public.lead_forms (deleted_at);

-- 2. Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  student_id uuid references public.students (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  name text not null,
  file_path text not null,
  file_size integer,
  file_type text,
  uploaded_by uuid references public.users (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint documents_name_length check (char_length(name) between 1 and 255)
);

create index if not exists idx_documents_tenant_student on public.documents (tenant_id, student_id);
create index if not exists idx_documents_tenant_application on public.documents (tenant_id, application_id);
create index if not exists idx_documents_deleted_at on public.documents (deleted_at);

-- 3. Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  color text not null default '#4F46E5',
  created_at timestamptz not null default timezone('utc', now()),
  constraint tags_name_length check (char_length(name) between 1 and 50)
);

create unique index if not exists ux_tags_tenant_name on public.tags (tenant_id, name);

-- 4. Application Tags Link table
create table if not exists public.application_tags (
  application_id uuid not null references public.applications (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (application_id, tag_id)
);

create index if not exists idx_application_tags_tag on public.application_tags (tag_id);

-- 5. Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  student_id uuid references public.students (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint comments_body_length check (char_length(body) >= 1)
);

create index if not exists idx_comments_tenant_student on public.comments (tenant_id, student_id);
create index if not exists idx_comments_tenant_application on public.comments (tenant_id, application_id);
create index if not exists idx_comments_tenant_task on public.comments (tenant_id, task_id);
create index if not exists idx_comments_deleted_at on public.comments (deleted_at);

-- 6. Activity Logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  activity_type text not null, -- 'call', 'email', 'meeting', 'whatsapp', 'status_change', 'system'
  subject text not null,
  description text,
  student_id uuid references public.students (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_activity_logs_tenant_student on public.activity_logs (tenant_id, student_id, created_at desc);
create index if not exists idx_activity_logs_tenant_application on public.activity_logs (tenant_id, application_id, created_at desc);
create index if not exists idx_activity_logs_user on public.activity_logs (user_id);

-- 7. Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  created_by uuid references public.users (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reports_name_length check (char_length(name) between 2 and 200)
);

create index if not exists idx_reports_deleted_at on public.reports (deleted_at);

-- 8. Team Metrics
create table if not exists public.team_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  metric_date date not null,
  leads_assigned integer not null default 0,
  applications_submitted integer not null default 0,
  applications_enrolled integer not null default 0,
  tasks_completed integer not null default 0,
  average_response_time_seconds integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists ux_team_metrics_tenant_user_date on public.team_metrics (tenant_id, user_id, metric_date);
create index if not exists idx_team_metrics_tenant_date on public.team_metrics (tenant_id, metric_date);

-- 9. Analytics Snapshots
create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  snapshot_date date not null,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists ux_analytics_snapshots_tenant_date on public.analytics_snapshots (tenant_id, snapshot_date);

-- Trigger hookups for updated_at fields
drop trigger if exists set_lead_forms_updated_at on public.lead_forms;
create trigger set_lead_forms_updated_at
before update on public.lead_forms
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

drop trigger if exists set_team_metrics_updated_at on public.team_metrics;
create trigger set_team_metrics_updated_at
before update on public.team_metrics
for each row execute function public.set_updated_at();

-- Grants
grant select, insert, update, delete on
  public.lead_forms,
  public.documents,
  public.tags,
  public.application_tags,
  public.comments,
  public.activity_logs,
  public.reports,
  public.team_metrics,
  public.analytics_snapshots
to authenticated;

-- Enable Row Level Security (RLS)
alter table public.lead_forms enable row level security;
alter table public.documents enable row level security;
alter table public.tags enable row level security;
alter table public.application_tags enable row level security;
alter table public.comments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.reports enable row level security;
alter table public.team_metrics enable row level security;
alter table public.analytics_snapshots enable row level security;

-- RLS Policies

-- Lead Forms Policies
drop policy if exists lead_forms_select on public.lead_forms;
create policy lead_forms_select on public.lead_forms
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists lead_forms_insert on public.lead_forms;
create policy lead_forms_insert on public.lead_forms
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists lead_forms_update on public.lead_forms;
create policy lead_forms_update on public.lead_forms
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists lead_forms_delete on public.lead_forms;
create policy lead_forms_delete on public.lead_forms
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Documents Policies
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents
for insert to authenticated
with check (
  public.can_manage_tenant(tenant_id)
  or public.can_counsellor_tenant(tenant_id)
);

drop policy if exists documents_update on public.documents;
create policy documents_update on public.documents
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or uploaded_by = auth.uid()
)
with check (
  public.can_manage_tenant(tenant_id)
  or uploaded_by = auth.uid()
);

drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents
for delete to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or uploaded_by = auth.uid()
);

-- Tags Policies
drop policy if exists tags_select on public.tags;
create policy tags_select on public.tags
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists tags_insert on public.tags;
create policy tags_insert on public.tags
for insert to authenticated
with check (public.can_manage_tenant(tenant_id) or public.can_counsellor_tenant(tenant_id));

drop policy if exists tags_update on public.tags;
create policy tags_update on public.tags
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists tags_delete on public.tags;
create policy tags_delete on public.tags
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Application Tags link Policies
drop policy if exists application_tags_select on public.application_tags;
create policy application_tags_select on public.application_tags
for select to authenticated
using (
  exists (
    select 1 from public.applications a
    where a.id = application_id
      and public.can_view_tenant(a.tenant_id)
  )
);

drop policy if exists application_tags_insert on public.application_tags;
create policy application_tags_insert on public.application_tags
for insert to authenticated
with check (
  exists (
    select 1 from public.applications a
    where a.id = application_id
      and (public.can_manage_tenant(a.tenant_id) or public.can_counsellor_tenant(a.tenant_id))
  )
);

drop policy if exists application_tags_delete on public.application_tags;
create policy application_tags_delete on public.application_tags
for delete to authenticated
using (
  exists (
    select 1 from public.applications a
    where a.id = application_id
      and (public.can_manage_tenant(a.tenant_id) or public.can_counsellor_tenant(a.tenant_id))
  )
);

-- Comments Policies
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
for insert to authenticated
with check (
  public.can_view_tenant(tenant_id)
  and user_id = auth.uid()
);

drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or user_id = auth.uid()
)
with check (
  public.can_manage_tenant(tenant_id)
  or user_id = auth.uid()
);

drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments
for delete to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or user_id = auth.uid()
);

-- Activity Logs Policies
drop policy if exists activity_logs_select on public.activity_logs;
create policy activity_logs_select on public.activity_logs
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists activity_logs_insert on public.activity_logs;
create policy activity_logs_insert on public.activity_logs
for insert to authenticated
with check (
  public.can_view_tenant(tenant_id)
  and (user_id = auth.uid() or public.is_service_role())
);

-- Reports Policies
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists reports_update on public.reports;
create policy reports_update on public.reports
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists reports_delete on public.reports;
create policy reports_delete on public.reports
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Team Metrics Policies
drop policy if exists team_metrics_select on public.team_metrics;
create policy team_metrics_select on public.team_metrics
for select to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or user_id = auth.uid()
);

drop policy if exists team_metrics_insert on public.team_metrics;
create policy team_metrics_insert on public.team_metrics
for insert to authenticated
with check (
  public.can_view_tenant(tenant_id)
  or public.is_service_role()
);

drop policy if exists team_metrics_update on public.team_metrics;
create policy team_metrics_update on public.team_metrics
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or public.is_service_role()
)
with check (
  public.can_manage_tenant(tenant_id)
  or public.is_service_role()
);

-- Analytics Snapshots Policies
drop policy if exists analytics_snapshots_select on public.analytics_snapshots;
create policy analytics_snapshots_select on public.analytics_snapshots
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists analytics_snapshots_insert on public.analytics_snapshots;
create policy analytics_snapshots_insert on public.analytics_snapshots
for insert to authenticated
with check (public.is_service_role() or public.can_manage_tenant(tenant_id));
