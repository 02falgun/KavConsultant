import { InboxWorkflow } from '@/features/inbox/components/inbox-workflow';

export default function InboxPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl">
        <InboxWorkflow />
      </div>
    </main>
  );
}
