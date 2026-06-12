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
