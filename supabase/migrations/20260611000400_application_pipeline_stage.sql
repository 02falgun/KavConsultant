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