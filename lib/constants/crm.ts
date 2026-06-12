export const APPLICATION_STAGES = ['new', 'qualified', 'document_collection', 'applied', 'offer_received', 'visa', 'enrolled', 'closed_lost'] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export const STUDENT_STATUSES = ['new', 'contacted', 'qualified', 'application_started', 'enrolled', 'lost', 'archived'] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const INBOX_FILTERS = ['all', 'new', 'due_today', 'overdue', 'unreachable', 'stale'] as const;
export type InboxFilter = (typeof INBOX_FILTERS)[number];

export const TASK_VIEW_MODES = ['list', 'calendar'] as const;
export type TaskViewMode = (typeof TASK_VIEW_MODES)[number];

export const CRM_PAGE_SIZE = 10;
export const CRM_EXPORT_PAGE_SIZE = 1000;

const stageAliases: Record<string, ApplicationStage> = {
  draft: 'new',
  submitted: 'qualified',
  under_review: 'applied',
  documents_pending: 'document_collection',
  accepted: 'offer_received',
  rejected: 'closed_lost',
  withdrawn: 'closed_lost',
  deferred: 'visa',
  enrolled: 'enrolled',
  new: 'new',
  qualified: 'qualified',
  document_collection: 'document_collection',
  applied: 'applied',
  offer_received: 'offer_received',
  visa: 'visa',
  closed_lost: 'closed_lost',
};

export function normalizeApplicationStage(value: string): ApplicationStage {
  return stageAliases[value] ?? 'new';
}

export function applicationStageLabel(stage: ApplicationStage) {
  return stage
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
