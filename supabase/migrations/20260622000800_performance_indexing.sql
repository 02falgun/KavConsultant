-- Phase 4: Database Indexing for High-Traffic Joined Tables & Lists

-- 1. Indexing joined entities in applications table to accelerate dashboard metrics and filters
CREATE INDEX IF NOT EXISTS idx_applications_tenant_university
  ON public.applications (tenant_id, university_id);

CREATE INDEX IF NOT EXISTS idx_applications_tenant_program
  ON public.applications (tenant_id, program_id);

-- 2. General list query indexes for sorting without status constraints (e.g. lists sorted by date)
CREATE INDEX IF NOT EXISTS idx_students_tenant_created_at_desc
  ON public.students (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_tenant_created_at_desc
  ON public.applications (tenant_id, created_at DESC);
