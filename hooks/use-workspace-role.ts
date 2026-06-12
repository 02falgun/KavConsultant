"use client";

import { useMemo } from 'react';
import { hasWorkspacePermission } from '@/lib/permissions/workspace';
import type { AuthRole } from '@/lib/constants/auth';

export function useWorkspaceRole(role: AuthRole | null) {
  const permissions = useMemo(() => {
    if (!role) {
      return {
        canManageWorkspace: false,
        canAdminWorkspace: false,
        canInvite: false,
      };
    }

    return {
      canManageWorkspace: hasWorkspacePermission(role, 'workspace.manage'),
      canAdminWorkspace: hasWorkspacePermission(role, 'workspace.admin'),
      canInvite: hasWorkspacePermission(role, 'members.invite'),
    };
  }, [role]);

  return permissions;
}
