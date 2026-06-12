export const APPLICATION_PIPELINE_STAGES = [
  'NEW',
  'QUALIFIED',
  'DOCUMENT_COLLECTION',
  'APPLIED',
  'OFFER_RECEIVED',
  'VISA',
  'ENROLLED',
  'CLOSED_LOST',
] as const;

export type ApplicationPipelineStage = (typeof APPLICATION_PIPELINE_STAGES)[number];

export const APPLICATION_STAGE_LABELS: Record<ApplicationPipelineStage, string> = {
  NEW: 'New',
  QUALIFIED: 'Qualified',
  DOCUMENT_COLLECTION: 'Document collection',
  APPLIED: 'Applied',
  OFFER_RECEIVED: 'Offer received',
  VISA: 'Visa',
  ENROLLED: 'Enrolled',
  CLOSED_LOST: 'Closed lost',
};

export const APPLICATION_STAGE_TO_DB_STATUS: Record<ApplicationPipelineStage, string> = {
  NEW: 'draft',
  QUALIFIED: 'submitted',
  DOCUMENT_COLLECTION: 'documents_pending',
  APPLIED: 'under_review',
  OFFER_RECEIVED: 'accepted',
  VISA: 'deferred',
  ENROLLED: 'enrolled',
  CLOSED_LOST: 'rejected',
};

export const DB_STATUS_TO_APPLICATION_STAGE: Record<string, ApplicationPipelineStage> = {
  draft: 'NEW',
  new: 'NEW',
  submitted: 'QUALIFIED',
  qualified: 'QUALIFIED',
  documents_pending: 'DOCUMENT_COLLECTION',
  under_review: 'APPLIED',
  accepted: 'OFFER_RECEIVED',
  deferred: 'VISA',
  enrolled: 'ENROLLED',
  rejected: 'CLOSED_LOST',
  withdrawn: 'CLOSED_LOST',
};

export function getApplicationStage(status: string): ApplicationPipelineStage {
  return DB_STATUS_TO_APPLICATION_STAGE[status] ?? 'NEW';
}

export function getDatabaseStatusForStage(stage: ApplicationPipelineStage): string {
  return APPLICATION_STAGE_TO_DB_STATUS[stage];
}

export function applicationStageLabel(stage: ApplicationPipelineStage) {
  return stage
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
