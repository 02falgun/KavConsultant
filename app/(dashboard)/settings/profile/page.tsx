import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getWorkspaceContext } from '@/lib/auth/workspace-context';
import { ProfileSettingsWorkflow } from '@/features/settings/components/profile-settings-workflow';

export default async function ProfileSettingsPage() {
  const context = await getWorkspaceContext();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, phone, title, locale, timezone, avatar_url')
    .eq('id', context.userId)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <ProfileSettingsWorkflow
        role={context.role}
        tenantId={context.tenantId}
        email={profile?.email ?? ''}
        avatarUrl={profile?.avatar_url ?? ''}
        initialProfile={{
          fullName: profile?.full_name ?? '',
          phone: profile?.phone ?? '',
          title: profile?.title ?? '',
          locale: profile?.locale ?? '',
          timezone: profile?.timezone ?? '',
        }}
      />
    </main>
  );
}
