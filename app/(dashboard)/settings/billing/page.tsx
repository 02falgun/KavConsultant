import { BillingSettingsWorkflow } from '@/features/settings/components/billing-settings-workflow';

export default function BillingSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <BillingSettingsWorkflow />
    </main>
  );
}
