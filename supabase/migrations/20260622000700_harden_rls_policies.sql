-- Supabase Migration: Harden RLS delete policies
-- Restricts DELETE operations on tenant data strictly to users with the 'admin' role in memberships.

BEGIN;

-- 1. Memberships
DROP POLICY IF EXISTS memberships_delete ON public.memberships;
CREATE POLICY memberships_delete ON public.memberships
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 2. Branches
DROP POLICY IF EXISTS branches_delete ON public.branches;
CREATE POLICY branches_delete ON public.branches
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 3. Universities
DROP POLICY IF EXISTS universities_delete ON public.universities;
CREATE POLICY universities_delete ON public.universities
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 4. Programs
DROP POLICY IF EXISTS programs_delete ON public.programs;
CREATE POLICY programs_delete ON public.programs
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 5. Students
DROP POLICY IF EXISTS students_delete ON public.students;
CREATE POLICY students_delete ON public.students
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 6. Applications
DROP POLICY IF EXISTS applications_delete ON public.applications;
CREATE POLICY applications_delete ON public.applications
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 7. Tasks
DROP POLICY IF EXISTS tasks_delete ON public.tasks;
CREATE POLICY tasks_delete ON public.tasks
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 8. Notifications
DROP POLICY IF EXISTS notifications_delete ON public.notifications;
CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 9. Landing Pages
DROP POLICY IF EXISTS landing_pages_delete ON public.landing_pages;
CREATE POLICY landing_pages_delete ON public.landing_pages
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 10. SLA Rules
DROP POLICY IF EXISTS sla_rules_delete ON public.sla_rules;
CREATE POLICY sla_rules_delete ON public.sla_rules
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

-- 11. Automations
DROP POLICY IF EXISTS automations_delete ON public.automations;
CREATE POLICY automations_delete ON public.automations
  FOR DELETE TO authenticated
  USING (public.can_admin_tenant(tenant_id));

COMMIT;
