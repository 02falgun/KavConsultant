import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { TenantContext } from '@/lib/types/crm';

export async function getWorkspaceContext(): Promise<TenantContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return null;
  }

  const { data: memberships } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', authData.user.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(1);

  const membership = memberships?.[0];

  if (!membership) {
    return null;
  }

  return {
    tenantId: membership.tenant_id,
    role: membership.role,
    userId: authData.user.id,
  };
}

export async function requireWorkspaceContext() {
  const context = await getWorkspaceContext();
  if (!context) {
    redirect('/signup');
  }
  return context;
}
