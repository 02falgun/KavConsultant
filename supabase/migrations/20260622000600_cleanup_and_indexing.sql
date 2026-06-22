-- Phase 1: Database Optimization & Data Cleanup

-- 1. SAFE DATA CLEANUP SCRIPT
-- This script deletes all student leads, applications, and tasks without affecting admin user accounts or tenants.
-- Foreign key references to child tables (documents, comments, application_tags) utilize ON DELETE CASCADE,
-- so this script automatically and safely cleans up dependent records as well.
-- Definition level RLS policies are schema structure constructs and remain completely unchanged.
BEGIN;

-- Explicitly delete tasks (child references) first to respect foreign key ordering, 
-- followed by applications and students.
DELETE FROM public.tasks;
DELETE FROM public.applications;
DELETE FROM public.students;

COMMIT;


-- 2. COMPOUND B-TREE INDEXES FOR MULTI-TENANT QUERY OPTIMIZATION
-- Under a multi-tenant RLS model, queries always filter by 'tenant_id'. 
-- Hence, optimal indexing requires compound indexes starting with 'tenant_id' to satisfy RLS filters.

-- A. Students Table Indexes
-- Index for status filters and date-based sorting
CREATE INDEX IF NOT EXISTS idx_students_tenant_status_created_at
  ON public.students (tenant_id, status, created_at DESC);

-- Index for counsellor assignment queries
CREATE INDEX IF NOT EXISTS idx_students_tenant_assigned_status
  ON public.students (tenant_id, assigned_counsellor_id, status);


-- B. Applications Table Indexes
-- Index for pipeline/stage tracking and sorting by date
CREATE INDEX IF NOT EXISTS idx_applications_tenant_status_created_at
  ON public.applications (tenant_id, status, created_at DESC);

-- Index for counselor assignment and application stages
CREATE INDEX IF NOT EXISTS idx_applications_tenant_assigned_status
  ON public.applications (tenant_id, assigned_counsellor_id, status);


-- C. Tasks Table Indexes
-- Index for status filters and due dates (e.g., due today, overdue tasks)
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_status_due
  ON public.tasks (tenant_id, status, due_at ASC NULLS LAST);

-- Index for task assignees (e.g., "My Tasks" dashboards)
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_assigned_status
  ON public.tasks (tenant_id, assigned_user_id, status);
