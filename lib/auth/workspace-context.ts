import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthRole } from '@/lib/constants/auth';

export type WorkspaceContext = {
  userId: string;
  tenantId: string;
  role: AuthRole;
};

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect('/signin');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', authData.user.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect('/signup');
  }

  return {
    userId: authData.user.id,
    tenantId: membership.tenant_id,
    role: membership.role as AuthRole,
  };
}
