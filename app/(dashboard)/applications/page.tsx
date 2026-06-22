import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { KanbanBoardSkeleton } from '@/components/ui/kanban-skeleton';

const ApplicationsWorkflow = dynamic(
  () => import('@/features/applications/components/applications-workflow').then((mod) => mod.ApplicationsWorkflow),
  {
    ssr: false,
    loading: () => <KanbanBoardSkeleton />,
  }
);

export default function ApplicationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<KanbanBoardSkeleton />}>
          <ApplicationsWorkflow />
        </Suspense>
      </div>
    </main>
  );
}
