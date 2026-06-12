import { BranchesSettingsWorkflow } from '@/features/settings/components/branches-settings-workflow';

export default function BranchesSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <BranchesSettingsWorkflow />
    </main>
  );
}
