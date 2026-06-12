import { redirect } from 'next/navigation';
import type { AuthRole } from '@/lib/constants/auth';
import { canAdminWorkspace, canManageWorkspace } from '@/lib/permissions/workspace';

export function requireWorkspaceAdmin(role: AuthRole | null) {
  if (!role || !canAdminWorkspace(role)) {
    redirect('/dashboard');
  }
}

export function requireWorkspaceManager(role: AuthRole | null) {
  if (!role || !canManageWorkspace(role)) {
    redirect('/dashboard');
  }
}
