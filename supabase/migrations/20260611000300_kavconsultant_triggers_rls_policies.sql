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
