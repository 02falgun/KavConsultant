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
