-- Supabase RLS Policy Verification Script
-- Run this inside the Supabase SQL editor or local psql cli.
-- It executes within a transactional block and rolls back automatically, ensuring zero permanent changes.

BEGIN;

-- 1. Create a mock tenant
INSERT INTO public.tenants (id, name, slug, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'Test Tenant', 'test-tenant-rls', 'active');

-- 2. Create mock auth users
INSERT INTO auth.users (id, email)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'admin@test-tenant.com'),
  ('33333333-3333-3333-3333-333333333333', 'counsellor@test-tenant.com');

-- 3. Create mock memberships mapping users to roles
INSERT INTO public.memberships (id, tenant_id, user_id, role, status)
VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'admin', 'active'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'counsellor', 'active');

-- 4. Create a student lead record belonging to the tenant
INSERT INTO public.students (id, tenant_id, full_name, status, source)
VALUES ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Security Test Student', 'lead', 'organic');

-- 5. TEST CASE: Verify counsellor role CANNOT delete student leads
-- Set auth user context to the counsellor
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
SET LOCAL role = 'authenticated';

DELETE FROM public.students 
WHERE id = '66666666-6666-6666-6666-666666666666';

-- Assertion: The row must still exist since delete is blocked by RLS policies
RESET role;
SET LOCAL request.jwt.claim.sub = '';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.students WHERE id = '66666666-6666-6666-6666-666666666666') THEN
    RAISE NOTICE '✅ SUCCESS: Counsellor delete action was correctly blocked by RLS.';
  ELSE
    RAISE EXCEPTION '❌ FAILURE: Counsellor bypassed delete RLS policy!';
  END IF;
END;
$$;

-- 6. TEST CASE: Verify admin role CAN delete student leads
-- Set auth user context to the admin
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
SET LOCAL role = 'authenticated';

DELETE FROM public.students 
WHERE id = '66666666-6666-6666-6666-666666666666';

-- Assertion: The row must be successfully deleted
RESET role;
SET LOCAL request.jwt.claim.sub = '';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = '66666666-6666-6666-6666-666666666666') THEN
    RAISE NOTICE '✅ SUCCESS: Admin delete action completed successfully.';
  ELSE
    RAISE EXCEPTION '❌ FAILURE: Admin delete action was blocked by RLS!';
  END IF;
END;
$$;

-- Rollback ensures the database state is left completely untouched
ROLLBACK;
