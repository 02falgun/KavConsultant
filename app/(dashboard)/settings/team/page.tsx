import { InviteMemberForm } from '@/features/auth/components/invite-member-form';

export default function TeamSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Workspace team</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Manage ADMIN, MANAGER, and COUNSELLOR invitations.</p>
        </div>
        <InviteMemberForm />
      </div>
    </main>
  );
}
