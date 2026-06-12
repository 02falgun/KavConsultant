import type { AuthRole } from '@/lib/constants/auth';

export type WorkspacePermission =
  | 'workspace.read'
  | 'workspace.manage'
  | 'workspace.admin'
  | 'members.invite'
  | 'members.resend'
  | 'members.cancel'
  | 'members.accept';

const rolePermissions: Record<AuthRole, WorkspacePermission[]> = {
  admin: ['workspace.read', 'workspace.manage', 'workspace.admin', 'members.invite', 'members.resend', 'members.cancel', 'members.accept'],
  manager: ['workspace.read', 'workspace.manage', 'members.invite', 'members.resend', 'members.cancel', 'members.accept'],
  counsellor: ['workspace.read', 'members.accept'],
};

export function hasWorkspacePermission(role: AuthRole, permission: WorkspacePermission): boolean {
  return rolePermissions[role].includes(permission);
}

export function canManageWorkspace(role: AuthRole): boolean {
  return hasWorkspacePermission(role, 'workspace.manage');
}

export function canAdminWorkspace(role: AuthRole): boolean {
  return hasWorkspacePermission(role, 'workspace.admin');
}
