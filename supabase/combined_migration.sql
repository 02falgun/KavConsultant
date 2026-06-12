-- ==========================================
-- SECTION 1: EXTENSIONS, ENUMS, SIMPLE UTILS (20260611000100 Part A)
-- ==========================================

-- KavConsultant CRM foundation
-- Extensions, enums, helper functions, and shared triggers

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";

create type public.tenant_status as enum (
  'onboarding',
  'active',
  'suspended',
  'closed'
);

create type public.membership_role as enum (
  'admin',
  'manager',
  'counsellor'
);

create type public.membership_status as enum (
  'invited',
  'active',
  'suspended',
  'revoked'
);

create type public.student_status as enum (
  'new',
  'contacted',
  'qualified',
  'application_started',
  'enrolled',
  'lost',
  'archived'
);

create type public.student_source as enum (
  'organic',
  'paid_ads',
  'referral',
  'website',
  'walk_in',
  'whatsapp',
  'import',
  'other'
);

create type public.application_status as enum (
  'draft',
  'submitted',
  'under_review',
  'documents_pending',
  'accepted',
  'rejected',
  'withdrawn',
  'deferred',
  'enrolled'
);

create type public.task_status as enum (
  'open',
  'in_progress',
  'blocked',
  'done',
  'cancelled'
);

create type public.priority_level as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

create type public.notification_type as enum (
  'system',
  'task',
  'application',
  'payment',
  'automation',
  'mention',
  'reminder'
);

create type public.notification_status as enum (
  'queued',
  'sent',
  'delivered',
  'read',
  'failed'
);

create type public.branch_status as enum (
  'active',
  'inactive'
);

create type public.university_type as enum (
  'university',
  'college',
  'institute',
  'language_school',
  'pathway_provider',
  'vocational_school'
);

create type public.landing_page_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.sla_scope as enum (
  'student',
  'application',
  'task'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'expired'
);

create type public.billing_provider as enum (
  'razorpay',
  'manual'
);

create type public.automation_status as enum (
  'draft',
  'active',
  'paused',
  'archived'
);

create type public.automation_trigger_type as enum (
  'student_created',
  'student_status_changed',
  'application_created',
  'task_overdue',
  'payment_received',
  'inbound_webhook'
);

create type public.automation_action_type as enum (
  'assign_owner',
  'create_task',
  'send_notification',
  'update_field',
  'webhook_call'
);

create type public.audit_action as enum (
  'insert',
  'update',
  'delete',
  'login',
  'logout',
  'invite',
  'archive',
  'restore',
  'export',
  'import',
  'webhook',
  'payment'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') = 'service_role';
$$;

-- ==========================================
-- SECTION 2: CORE TABLES & INDEXES (20260611000200)
-- ==========================================

-- KavConsultant CRM core tables

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  legal_name text,
  status public.tenant_status not null default 'onboarding',
  billing_email citext,
  primary_domain text,
  country text,
  timezone text not null default 'UTC',
  currency char(3) not null default 'USD',
  brand_color text,
  logo_url text,
  trial_ends_at timestamptz,
  onboarding_completed_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tenants_name_length check (char_length(name) between 2 and 200),
  constraint tenants_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tenants_currency_format check (currency ~ '^[A-Z]{3}$')
);

create index if not exists idx_tenants_status on public.tenants (status);
create index if not exists idx_tenants_deleted_at on public.tenants (deleted_at);

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null unique,
  full_name text,
  phone text,
  avatar_url text,
  locale text,
  timezone text,
  title text,
  is_active boolean not null default true,
  last_active_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint users_full_name_length check (full_name is null or char_length(full_name) between 1 and 200),
  constraint users_phone_length check (phone is null or char_length(phone) between 5 and 32)
);

create index if not exists idx_users_full_name_trgm on public.users using gin (full_name gin_trgm_ops);
create index if not exists idx_users_deleted_at on public.users (deleted_at);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid references public.users (id) on delete cascade,
  invited_email citext,
  role public.membership_role not null default 'counsellor',
  status public.membership_status not null default 'invited',
  invited_by uuid references public.users (id) on delete set null,
  joined_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint memberships_user_or_email check (user_id is not null or invited_email is not null),
  constraint memberships_joined_at_check check (joined_at is null or joined_at >= created_at),
  constraint memberships_active_status_check check (
    status <> 'active' or (user_id is not null and deleted_at is null)
  )
);

create unique index if not exists ux_memberships_tenant_user_active
  on public.memberships (tenant_id, user_id)
  where user_id is not null and deleted_at is null;

create unique index if not exists ux_memberships_tenant_invited_email_active
  on public.memberships (tenant_id, invited_email)
  where invited_email is not null and deleted_at is null;

create index if not exists idx_memberships_tenant_role_status on public.memberships (tenant_id, role, status);
create index if not exists idx_memberships_user_id on public.memberships (user_id);
create index if not exists idx_memberships_deleted_at on public.memberships (deleted_at);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  code text not null,
  name text not null,
  email citext,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  country text,
  postal_code text,
  timezone text,
  is_primary boolean not null default false,
  status public.branch_status not null default 'active',
  manager_user_id uuid references public.users (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint branches_code_length check (char_length(code) between 1 and 50),
  constraint branches_name_length check (char_length(name) between 2 and 200)
);

create unique index if not exists ux_branches_tenant_code_active
  on public.branches (tenant_id, code)
  where deleted_at is null;

create unique index if not exists ux_branches_tenant_primary_active
  on public.branches (tenant_id)
  where is_primary = true and deleted_at is null;

create index if not exists idx_branches_tenant_status on public.branches (tenant_id, status);
create index if not exists idx_branches_manager_user_id on public.branches (manager_user_id);
create index if not exists idx_branches_deleted_at on public.branches (deleted_at);

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  slug citext not null,
  country text not null,
  city text,
  website text,
  email citext,
  phone text,
  type public.university_type not null default 'university',
  ranking integer,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint universities_name_length check (char_length(name) between 2 and 250),
  constraint universities_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint universities_ranking_check check (ranking is null or ranking > 0)
);

create unique index if not exists ux_universities_tenant_slug_active
  on public.universities (tenant_id, slug)
  where deleted_at is null;

create index if not exists idx_universities_tenant_country on public.universities (tenant_id, country);
create index if not exists idx_universities_tenant_name_trgm on public.universities using gin (name gin_trgm_ops);
create index if not exists idx_universities_deleted_at on public.universities (deleted_at);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  code text not null,
  name text not null,
  degree_level text,
  field_of_study text,
  duration_months integer,
  intake_months text[] not null default '{}'::text[],
  tuition_fee_min numeric(12,2),
  tuition_fee_max numeric(12,2),
  currency char(3) not null default 'USD',
  min_gpa numeric(4,2),
  language_requirements jsonb not null default '{}'::jsonb,
  scholarship_available boolean not null default false,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint programs_code_length check (char_length(code) between 1 and 80),
  constraint programs_name_length check (char_length(name) between 2 and 250),
  constraint programs_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint programs_duration_check check (duration_months is null or duration_months > 0),
  constraint programs_fee_check check (tuition_fee_min is null or tuition_fee_min >= 0),
  constraint programs_fee_range_check check (tuition_fee_max is null or tuition_fee_min is null or tuition_fee_max >= tuition_fee_min)
);

create unique index if not exists ux_programs_tenant_university_code_active
  on public.programs (tenant_id, university_id, code)
  where deleted_at is null;

create index if not exists idx_programs_tenant_university_active on public.programs (tenant_id, university_id, is_active);
create index if not exists idx_programs_branch_id on public.programs (branch_id);
create index if not exists idx_programs_deleted_at on public.programs (deleted_at);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  assigned_counsellor_id uuid references public.users (id) on delete set null,
  created_by uuid references public.users (id) on delete set null,
  full_name text not null,
  email citext,
  phone text,
  date_of_birth date,
  nationality text,
  preferred_country text,
  source public.student_source not null default 'organic',
  status public.student_status not null default 'new',
  lead_score integer not null default 0,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  tags text[] not null default '{}'::text[],
  notes text,
  last_contacted_at timestamptz,
  converted_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint students_name_length check (char_length(full_name) between 2 and 250),
  constraint students_email_length check (email is null or char_length(email) between 3 and 320),
  constraint students_phone_length check (phone is null or char_length(phone) between 5 and 32),
  constraint students_score_check check (lead_score between 0 and 100),
  constraint students_budget_check check (budget_min is null or budget_min >= 0),
  constraint students_budget_range_check check (budget_max is null or budget_min is null or budget_max >= budget_min),
  constraint students_dob_check check (date_of_birth is null or date_of_birth < current_date)
);

create unique index if not exists ux_students_tenant_email_active
  on public.students (tenant_id, email)
  where email is not null and deleted_at is null;

create unique index if not exists ux_students_tenant_phone_active
  on public.students (tenant_id, phone)
  where phone is not null and deleted_at is null;

create index if not exists idx_students_tenant_status_created_at on public.students (tenant_id, status, created_at desc);
create index if not exists idx_students_tenant_assigned_status on public.students (tenant_id, assigned_counsellor_id, status);
create index if not exists idx_students_tenant_branch on public.students (tenant_id, branch_id);
create index if not exists idx_students_tenant_tags on public.students using gin (tags);
create index if not exists idx_students_name_trgm on public.students using gin (full_name gin_trgm_ops);
create index if not exists idx_students_deleted_at on public.students (deleted_at);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  university_id uuid not null references public.universities (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  assigned_counsellor_id uuid references public.users (id) on delete set null,
  created_by uuid references public.users (id) on delete set null,
  application_number text not null,
  status public.application_status not null default 'draft',
  intake_term text,
  intake_year integer,
  submitted_at timestamptz,
  decision_at timestamptz,
  external_reference text,
  fee_amount numeric(12,2),
  currency char(3) not null default 'USD',
  documents jsonb not null default '{}'::jsonb,
  notes text,
  rejection_reason text,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint applications_number_length check (char_length(application_number) between 1 and 80),
  constraint applications_intake_year_check check (intake_year is null or intake_year between 2000 and 2100),
  constraint applications_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint applications_fee_check check (fee_amount is null or fee_amount >= 0),
  constraint applications_submitted_at_check check (submitted_at is null or submitted_at >= created_at),
  constraint applications_decision_at_check check (decision_at is null or submitted_at is null or decision_at >= submitted_at)
);

create unique index if not exists ux_applications_tenant_number_active
  on public.applications (tenant_id, application_number)
  where deleted_at is null;

create index if not exists idx_applications_tenant_status_created_at on public.applications (tenant_id, status, created_at desc);
create index if not exists idx_applications_tenant_student on public.applications (tenant_id, student_id);
create index if not exists idx_applications_tenant_assigned_status on public.applications (tenant_id, assigned_counsellor_id, status);
create index if not exists idx_applications_deleted_at on public.applications (deleted_at);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  student_id uuid references public.students (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  assigned_user_id uuid references public.users (id) on delete set null,
  created_by uuid references public.users (id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'open',
  priority public.priority_level not null default 'medium',
  due_at timestamptz,
  completed_at timestamptz,
  reminder_at timestamptz,
  checklist jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tasks_title_length check (char_length(title) between 2 and 250),
  constraint tasks_due_at_check check (due_at is null or due_at >= created_at),
  constraint tasks_completed_at_check check (completed_at is null or completed_at >= created_at)
);

create index if not exists idx_tasks_tenant_status_due on public.tasks (tenant_id, status, due_at);
create index if not exists idx_tasks_tenant_assigned_status on public.tasks (tenant_id, assigned_user_id, status);
create index if not exists idx_tasks_tenant_student on public.tasks (tenant_id, student_id);
create index if not exists idx_tasks_tenant_application on public.tasks (tenant_id, application_id);
create index if not exists idx_tasks_deleted_at on public.tasks (deleted_at);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  type public.notification_type not null,
  status public.notification_status not null default 'queued',
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  link_url text,
  read_at timestamptz,
  delivered_at timestamptz,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notifications_title_length check (char_length(title) between 1 and 200),
  constraint notifications_read_after_create check (read_at is null or read_at >= created_at),
  constraint notifications_delivered_after_create check (delivered_at is null or delivered_at >= created_at)
);

create index if not exists idx_notifications_tenant_user_status_created on public.notifications (tenant_id, user_id, status, created_at desc);
create index if not exists idx_notifications_tenant_type on public.notifications (tenant_id, type);
create index if not exists idx_notifications_deleted_at on public.notifications (deleted_at);

create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  slug citext not null,
  title text not null,
  meta_title text,
  meta_description text,
  content jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  status public.landing_page_status not null default 'draft',
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint landing_pages_title_length check (char_length(title) between 2 and 250),
  constraint landing_pages_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists ux_landing_pages_tenant_slug_active
  on public.landing_pages (tenant_id, slug)
  where deleted_at is null;

create index if not exists idx_landing_pages_tenant_status on public.landing_pages (tenant_id, status);
create index if not exists idx_landing_pages_branch_id on public.landing_pages (branch_id);
create index if not exists idx_landing_pages_deleted_at on public.landing_pages (deleted_at);

create table if not exists public.sla_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  name text not null,
  scope public.sla_scope not null,
  priority public.priority_level not null default 'medium',
  first_response_minutes integer,
  resolution_minutes integer,
  escalation_minutes integer,
  escalation_user_id uuid references public.users (id) on delete set null,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sla_rules_name_length check (char_length(name) between 2 and 200),
  constraint sla_rules_first_response_check check (first_response_minutes is null or first_response_minutes > 0),
  constraint sla_rules_resolution_check check (resolution_minutes is null or resolution_minutes > 0),
  constraint sla_rules_escalation_check check (escalation_minutes is null or escalation_minutes > 0)
);

create unique index if not exists ux_sla_rules_tenant_name_active
  on public.sla_rules (tenant_id, name)
  where deleted_at is null;

create index if not exists idx_sla_rules_tenant_scope_priority on public.sla_rules (tenant_id, scope, priority, is_active);
create index if not exists idx_sla_rules_deleted_at on public.sla_rules (deleted_at);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  actor_user_id uuid references public.users (id) on delete set null,
  entity_name text not null,
  entity_id uuid,
  action public.audit_action not null,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint audit_logs_entity_name_length check (char_length(entity_name) between 1 and 120)
);

create index if not exists idx_audit_logs_tenant_created_at on public.audit_logs (tenant_id, created_at desc);
create index if not exists idx_audit_logs_tenant_entity on public.audit_logs (tenant_id, entity_name, entity_id);
create index if not exists idx_audit_logs_actor_user_id on public.audit_logs (actor_user_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  provider public.billing_provider not null default 'razorpay',
  provider_customer_id text,
  provider_subscription_id text,
  plan_key text not null,
  status public.subscription_status not null default 'trialing',
  seats integer not null default 1,
  amount_cents integer,
  currency char(3) not null default 'USD',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint subscriptions_plan_key_length check (char_length(plan_key) between 1 and 120),
  constraint subscriptions_seats_check check (seats > 0),
  constraint subscriptions_amount_check check (amount_cents is null or amount_cents >= 0),
  constraint subscriptions_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint subscriptions_period_check check (
    current_period_end is null or current_period_start is null or current_period_end >= current_period_start
  )
);

create unique index if not exists ux_subscriptions_provider_subscription_id_active
  on public.subscriptions (provider_subscription_id)
  where provider_subscription_id is not null and deleted_at is null;

create index if not exists idx_subscriptions_tenant_status on public.subscriptions (tenant_id, status);
create index if not exists idx_subscriptions_tenant_provider_customer on public.subscriptions (tenant_id, provider_customer_id);
create index if not exists idx_subscriptions_deleted_at on public.subscriptions (deleted_at);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  branch_id uuid references public.branches (id) on delete set null,
  name text not null,
  description text,
  trigger_type public.automation_trigger_type not null,
  trigger_config jsonb not null default '{}'::jsonb,
  condition_config jsonb not null default '{}'::jsonb,
  action_type public.automation_action_type not null,
  action_config jsonb not null default '{}'::jsonb,
  status public.automation_status not null default 'draft',
  priority public.priority_level not null default 'medium',
  last_run_at timestamptz,
  next_run_at timestamptz,
  run_count integer not null default 0,
  error_count integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint automations_name_length check (char_length(name) between 2 and 200),
  constraint automations_run_count_check check (run_count >= 0),
  constraint automations_error_count_check check (error_count >= 0)
);

create unique index if not exists ux_automations_tenant_name_active
  on public.automations (tenant_id, name)
  where deleted_at is null;

create index if not exists idx_automations_tenant_status on public.automations (tenant_id, status);
create index if not exists idx_automations_tenant_trigger on public.automations (tenant_id, trigger_type, priority);
create index if not exists idx_automations_deleted_at on public.automations (deleted_at);

-- ==========================================
-- SECTION 3: COMPLEX HELPER FUNCTIONS (20260611000100 Part B)
-- ==========================================

create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships memberships
    where memberships.tenant_id = p_tenant_id
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
      and memberships.deleted_at is null
  );
$$;

create or replace function public.has_tenant_role(
  p_tenant_id uuid,
  p_roles public.membership_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships memberships
    where memberships.tenant_id = p_tenant_id
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
      and memberships.deleted_at is null
      and memberships.role = any (p_roles)
  );
$$;

create or replace function public.can_view_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
as $$
  select public.is_service_role() or public.is_tenant_member(p_tenant_id);
$$;

create or replace function public.can_manage_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
as $$
  select public.is_service_role() or public.has_tenant_role(p_tenant_id, array['admin'::public.membership_role, 'manager'::public.membership_role]);
$$;

create or replace function public.can_admin_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
as $$
  select public.is_service_role() or public.has_tenant_role(p_tenant_id, array['admin'::public.membership_role]);
$$;

create or replace function public.can_counsellor_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
as $$
  select public.is_service_role() or public.has_tenant_role(p_tenant_id, array['counsellor'::public.membership_role]);
$$;

create or replace function public.can_view_user_profile(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_service_role()
    or p_user_id = auth.uid()
    or exists (
      select 1
      from public.memberships my_membership
      join public.memberships target_membership
        on target_membership.tenant_id = my_membership.tenant_id
      where my_membership.user_id = auth.uid()
        and my_membership.status = 'active'
        and my_membership.deleted_at is null
        and target_membership.user_id = p_user_id
        and target_membership.status = 'active'
        and target_membership.deleted_at is null
    );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    full_name,
    avatar_url,
    phone,
    locale,
    timezone
  )
  values (
    new.id,
    new.email,
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'phone', new.phone), ''),
    nullif(new.raw_user_meta_data ->> 'locale', ''),
    nullif(new.raw_user_meta_data ->> 'timezone', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
        phone = coalesce(excluded.phone, public.users.phone),
        locale = coalesce(excluded.locale, public.users.locale),
        timezone = coalesce(excluded.timezone, public.users.timezone),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.set_audit_log_actor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.actor_user_id is null then
    new.actor_user_id = auth.uid();
  end if;

  return new;
end;
$$;

create or replace function public.create_workspace_for_owner(
  p_user_id uuid,
  p_email citext,
  p_full_name text,
  p_workspace_name text,
  p_workspace_slug citext
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  insert into public.tenants (name, slug, status, onboarding_completed_at)
  values (p_workspace_name, p_workspace_slug, 'active', timezone('utc', now()))
  returning id into v_tenant_id;

  insert into public.users (id, email, full_name)
  values (p_user_id, p_email, p_full_name)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name),
        updated_at = timezone('utc', now());

  insert into public.memberships (tenant_id, user_id, role, status, joined_at)
  values (v_tenant_id, p_user_id, 'admin', 'active', timezone('utc', now()));

  return v_tenant_id;
end;
$$;

create or replace function public.accept_workspace_invitation(
  p_membership_id uuid,
  p_user_id uuid,
  p_user_email citext
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  update public.memberships
  set user_id = p_user_id,
      status = 'active',
      joined_at = timezone('utc', now())
  where id = p_membership_id
    and deleted_at is null
    and (invited_email is null or invited_email = p_user_email)
  returning tenant_id into v_tenant_id;

  if v_tenant_id is null then
    raise exception 'Invitation not found';
  end if;

  insert into public.users (id, email)
  values (p_user_id, p_user_email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = timezone('utc', now());

  return v_tenant_id;
end;
$$;

create or replace function public.create_workspace_invitation(
  p_tenant_id uuid,
  p_invited_email citext,
  p_role public.membership_role,
  p_invited_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership_id uuid;
begin
  insert into public.memberships (
    tenant_id,
    invited_email,
    role,
    status,
    invited_by
  )
  values (
    p_tenant_id,
    p_invited_email,
    p_role,
    'invited',
    p_invited_by
  )
  returning id into v_membership_id;

  return v_membership_id;
end;
$$;

create or replace function public.revoke_workspace_invitation(
  p_membership_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.memberships
  set status = 'revoked'
  where id = p_membership_id
    and deleted_at is null;

  return found;
end;
$$;

-- ==========================================
-- SECTION 4: CORE TRIGGERS & RLS POLICIES (20260611000300)
-- ==========================================

-- KavConsultant CRM triggers, grants, and RLS policies

-- Maintain users profile rows from Supabase Auth

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Shared updated_at trigger wiring

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_memberships_updated_at on public.memberships;
create trigger set_memberships_updated_at
before update on public.memberships
for each row execute function public.set_updated_at();

drop trigger if exists set_branches_updated_at on public.branches;
create trigger set_branches_updated_at
before update on public.branches
for each row execute function public.set_updated_at();

drop trigger if exists set_universities_updated_at on public.universities;
create trigger set_universities_updated_at
before update on public.universities
for each row execute function public.set_updated_at();

drop trigger if exists set_programs_updated_at on public.programs;
create trigger set_programs_updated_at
before update on public.programs
for each row execute function public.set_updated_at();

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_notifications_updated_at on public.notifications;
create trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

drop trigger if exists set_landing_pages_updated_at on public.landing_pages;
create trigger set_landing_pages_updated_at
before update on public.landing_pages
for each row execute function public.set_updated_at();

drop trigger if exists set_sla_rules_updated_at on public.sla_rules;
create trigger set_sla_rules_updated_at
before update on public.sla_rules
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_automations_updated_at on public.automations;
create trigger set_automations_updated_at
before update on public.automations
for each row execute function public.set_updated_at();

-- Audit actor stamping

drop trigger if exists set_audit_logs_actor on public.audit_logs;
create trigger set_audit_logs_actor
before insert on public.audit_logs
for each row execute function public.set_audit_log_actor();

-- Privileges

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.tenants,
  public.users,
  public.memberships,
  public.branches,
  public.universities,
  public.programs,
  public.students,
  public.applications,
  public.tasks,
  public.notifications,
  public.landing_pages,
  public.sla_rules,
  public.audit_logs,
  public.subscriptions,
  public.automations
to authenticated;

-- Row Level Security

alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.memberships enable row level security;
alter table public.branches enable row level security;
alter table public.universities enable row level security;
alter table public.programs enable row level security;
alter table public.students enable row level security;
alter table public.applications enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.landing_pages enable row level security;
alter table public.sla_rules enable row level security;
alter table public.audit_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.automations enable row level security;

-- Tenants

drop policy if exists tenants_select on public.tenants;
create policy tenants_select on public.tenants
for select to authenticated
using (public.can_view_tenant(id));

drop policy if exists tenants_insert on public.tenants;
create policy tenants_insert on public.tenants
for insert to authenticated
with check (auth.uid() is not null or public.is_service_role());

drop policy if exists tenants_update on public.tenants;
create policy tenants_update on public.tenants
for update to authenticated
using (public.can_admin_tenant(id))
with check (public.can_admin_tenant(id));

drop policy if exists tenants_delete on public.tenants;
create policy tenants_delete on public.tenants
for delete to authenticated
using (public.can_admin_tenant(id));

-- Users

drop policy if exists users_select on public.users;
create policy users_select on public.users
for select to authenticated
using (public.can_view_user_profile(id));

drop policy if exists users_update on public.users;
create policy users_update on public.users
for update to authenticated
using (auth.uid() = id or public.is_service_role())
with check (auth.uid() = id or public.is_service_role());

-- Memberships

drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists memberships_insert on public.memberships;
create policy memberships_insert on public.memberships
for insert to authenticated
with check (
  public.can_manage_tenant(tenant_id)
  and (
    role <> 'admin'
    or public.can_admin_tenant(tenant_id)
  )
);

drop policy if exists memberships_update on public.memberships;
create policy memberships_update on public.memberships
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (
  public.can_manage_tenant(tenant_id)
  and (
    role <> 'admin'
    or public.can_admin_tenant(tenant_id)
  )
);

drop policy if exists memberships_delete on public.memberships;
create policy memberships_delete on public.memberships
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Branches

drop policy if exists branches_select on public.branches;
create policy branches_select on public.branches
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists branches_insert on public.branches;
create policy branches_insert on public.branches
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists branches_update on public.branches;
create policy branches_update on public.branches
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists branches_delete on public.branches;
create policy branches_delete on public.branches
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Universities

drop policy if exists universities_select on public.universities;
create policy universities_select on public.universities
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists universities_insert on public.universities;
create policy universities_insert on public.universities
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists universities_update on public.universities;
create policy universities_update on public.universities
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists universities_delete on public.universities;
create policy universities_delete on public.universities
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Programs

drop policy if exists programs_select on public.programs;
create policy programs_select on public.programs
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists programs_insert on public.programs;
create policy programs_insert on public.programs
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists programs_update on public.programs;
create policy programs_update on public.programs
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists programs_delete on public.programs;
create policy programs_delete on public.programs
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Students

drop policy if exists students_select on public.students;
create policy students_select on public.students
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists students_insert on public.students;
create policy students_insert on public.students
for insert to authenticated
with check (
  public.can_manage_tenant(tenant_id)
  or (
    public.can_counsellor_tenant(tenant_id)
    and (assigned_counsellor_id is null or assigned_counsellor_id = auth.uid())
  )
);

drop policy if exists students_update on public.students;
create policy students_update on public.students
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or (
    public.can_counsellor_tenant(tenant_id)
    and (assigned_counsellor_id = auth.uid() or created_by = auth.uid())
  )
)
with check (
  public.can_manage_tenant(tenant_id)
  or (
    public.can_counsellor_tenant(tenant_id)
    and (assigned_counsellor_id = auth.uid() or created_by = auth.uid())
  )
);

drop policy if exists students_delete on public.students;
create policy students_delete on public.students
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Applications

drop policy if exists applications_select on public.applications;
create policy applications_select on public.applications
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists applications_insert on public.applications;
create policy applications_insert on public.applications
for insert to authenticated
with check (
  public.can_manage_tenant(tenant_id)
  or (
    public.can_counsellor_tenant(tenant_id)
    and (assigned_counsellor_id is null or assigned_counsellor_id = auth.uid())
  )
);

drop policy if exists applications_update on public.applications;
create policy applications_update on public.applications
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or (
    public.can_counsellor_tenant(tenant_id)
    and (assigned_counsellor_id = auth.uid() or created_by = auth.uid())
  )
)
with check (
  public.can_manage_tenant(tenant_id)
  or (
    public.can_counsellor_tenant(tenant_id)
    and (assigned_counsellor_id = auth.uid() or created_by = auth.uid())
  )
);

drop policy if exists applications_delete on public.applications;
create policy applications_delete on public.applications
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Tasks

drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
for insert to authenticated
with check (
  public.can_manage_tenant(tenant_id)
  or public.can_counsellor_tenant(tenant_id)
);

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or assigned_user_id = auth.uid()
  or created_by = auth.uid()
)
with check (
  public.can_manage_tenant(tenant_id)
  or assigned_user_id = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Notifications

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
for select to authenticated
using (user_id = auth.uid() or public.can_manage_tenant(tenant_id));

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
for update to authenticated
using (user_id = auth.uid() or public.can_manage_tenant(tenant_id))
with check (user_id = auth.uid() or public.can_manage_tenant(tenant_id));

drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
for delete to authenticated
using (user_id = auth.uid() or public.can_manage_tenant(tenant_id));

-- Landing pages

drop policy if exists landing_pages_select on public.landing_pages;
create policy landing_pages_select on public.landing_pages
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists landing_pages_insert on public.landing_pages;
create policy landing_pages_insert on public.landing_pages
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists landing_pages_update on public.landing_pages;
create policy landing_pages_update on public.landing_pages
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists landing_pages_delete on public.landing_pages;
create policy landing_pages_delete on public.landing_pages
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- SLA rules

drop policy if exists sla_rules_select on public.sla_rules;
create policy sla_rules_select on public.sla_rules
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists sla_rules_insert on public.sla_rules;
create policy sla_rules_insert on public.sla_rules
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists sla_rules_update on public.sla_rules;
create policy sla_rules_update on public.sla_rules
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists sla_rules_delete on public.sla_rules;
create policy sla_rules_delete on public.sla_rules
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- Audit logs

drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
for select to authenticated
using (public.can_admin_tenant(tenant_id) or public.has_tenant_role(tenant_id, array['manager'::public.membership_role]));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs
for insert to authenticated
with check (public.is_service_role());

-- Subscriptions

drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions
for select to authenticated
using (public.can_admin_tenant(tenant_id));

drop policy if exists subscriptions_insert on public.subscriptions;
create policy subscriptions_insert on public.subscriptions
for insert to authenticated
with check (public.can_admin_tenant(tenant_id) or public.is_service_role());

drop policy if exists subscriptions_update on public.subscriptions;
create policy subscriptions_update on public.subscriptions
for update to authenticated
using (public.can_admin_tenant(tenant_id) or public.is_service_role())
with check (public.can_admin_tenant(tenant_id) or public.is_service_role());

drop policy if exists subscriptions_delete on public.subscriptions;
create policy subscriptions_delete on public.subscriptions
for delete to authenticated
using (public.can_admin_tenant(tenant_id) or public.is_service_role());

-- Automations

drop policy if exists automations_select on public.automations;
create policy automations_select on public.automations
for select to authenticated
using (public.can_view_tenant(tenant_id));

drop policy if exists automations_insert on public.automations;
create policy automations_insert on public.automations
for insert to authenticated
with check (public.can_manage_tenant(tenant_id));

drop policy if exists automations_update on public.automations;
create policy automations_update on public.automations
for update to authenticated
using (public.can_manage_tenant(tenant_id))
with check (public.can_manage_tenant(tenant_id));

drop policy if exists automations_delete on public.automations;
create policy automations_delete on public.automations
for delete to authenticated
using (public.can_manage_tenant(tenant_id));

-- ==========================================
-- SECTION 5: PIPELINE CONFIGURATION (20260611000400)
-- ==========================================

do $$
begin
  create type public.application_pipeline_stage as enum (
    'new',
    'qualified',
    'document_collection',
    'applied',
    'offer_received',
    'visa',
    'enrolled',
    'closed_lost'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.applications
  alter column status drop default,
  alter column status type public.application_pipeline_stage using (
    case status::text
      when 'draft' then 'new'
      when 'submitted' then 'qualified'
      when 'documents_pending' then 'document_collection'
      when 'under_review' then 'applied'
      when 'accepted' then 'offer_received'
      when 'deferred' then 'visa'
      when 'enrolled' then 'enrolled'
      when 'rejected' then 'closed_lost'
      when 'withdrawn' then 'closed_lost'
      else 'new'
    end::public.application_pipeline_stage
  ),
  alter column status set default 'new';

-- ==========================================
-- SECTION 6: REMAINING TABLES & POLICIES (20260612000500)
-- ==========================================

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

