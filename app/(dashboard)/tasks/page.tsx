import { TasksWorkflow } from '@/features/tasks/components/tasks-workflow';

export default function TasksPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl">
        <TasksWorkflow />
      </div>
    </main>
  );
}
