import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getWorkspaceContext } from '@/lib/auth/workspace-context';
import { SidebarShell } from '@/components/layout/sidebar-shell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const context = await getWorkspaceContext();
  const supabase = await createSupabaseServerClient();

  // Fetch tenant details
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, logo_url, slug')
    .eq('id', context.tenantId)
    .maybeSingle();

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('full_name, email, avatar_url')
    .eq('id', context.userId)
    .maybeSingle();

  const userEmail = userProfile?.email || '';
  const userInitials = userProfile?.full_name || 'User';

  return (
    <SidebarShell
      user={{
        name: userProfile?.full_name || 'CRM User',
        email: userEmail,
        avatar: userProfile?.avatar_url || '',
        role: context.role,
      }}
      tenant={{
        id: context.tenantId,
        name: tenant?.name || 'Workspace',
        logo: tenant?.logo_url || '',
        slug: tenant?.slug || '',
      }}
    >
      {children}
    </SidebarShell>
  );
}
