"use server";

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  acceptInviteSchema,
  cancelInviteSchema,
  forgotPasswordSchema,
  inviteMemberSchema,
  loginSchema,
  magicLinkSchema,
  resetPasswordSchema,
  resendInviteSchema,
  signupSchema,
} from '@/lib/validations/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/constants/auth';

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function ensureCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Unauthorized');
  }

  return { supabase, user: data.user };
}

export async function signUpAction(input: unknown): Promise<ActionResult<{ tenantId: string }>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid signup data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { fullName, email, password, workspaceName, workspaceSlug } = parsed.data;
  const admin = createSupabaseAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !authData.user) {
    return { ok: false, error: authError?.message ?? 'Failed to create user' };
  }

  const { data: tenantId, error: workspaceError } = await admin.rpc('create_workspace_for_owner', {
    p_user_id: authData.user.id,
    p_email: email,
    p_full_name: fullName,
    p_workspace_name: workspaceName,
    p_workspace_slug: workspaceSlug,
  });

  if (workspaceError) {
    return { ok: false, error: workspaceError.message };
  }

  const client = await createSupabaseServerClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });

  if (signInError) {
    return { ok: false, error: signInError.message };
  }

  return { ok: true, data: { tenantId: tenantId as string } };
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid login data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: error.message };
  }

  redirect(DEFAULT_LOGIN_REDIRECT);
}

export async function magicLinkAction(input: unknown): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid email', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid email', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid password', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function inviteMemberAction(input: unknown): Promise<ActionResult<{ membershipId: string }>> {
  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid invite data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await ensureCurrentUser();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('tenant_id', parsed.data.tenantId)
    .eq('user_id', user.id)
    .single();

  if (!membership || membership.role !== 'admin' && membership.role !== 'manager') {
    return { ok: false, error: 'Insufficient permissions' };
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc('create_workspace_invitation', {
    p_tenant_id: parsed.data.tenantId,
    p_invited_email: parsed.data.email,
    p_role: parsed.data.role,
    p_invited_by: user.id,
  });

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Failed to invite member' };
  }

  await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`,
  });

  return { ok: true, data: { membershipId: data as string } };
}

export async function acceptInvitationAction(input: unknown): Promise<ActionResult> {
  const parsed = acceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid invitation data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const admin = createSupabaseAdminClient();
  const { data: invitation, error: invitationError } = await admin
    .from('memberships')
    .select('id, tenant_id, invited_email, user_id, status')
    .eq('id', parsed.data.invitationId)
    .single();

  if (invitationError || !invitation) {
    return { ok: false, error: 'Invitation not found' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: authUser } = await supabase.auth.getUser();

  if (!authUser.user) {
    return { ok: false, error: 'Unauthorized' };
  }

  if (invitation.invited_email && invitation.invited_email !== authUser.user.email) {
    return { ok: false, error: 'Invitation email mismatch' };
  }

  const { error } = await admin.rpc('accept_workspace_invitation', {
    p_membership_id: invitation.id,
    p_user_id: authUser.user.id,
    p_user_email: authUser.user.email,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (parsed.data.password) {
    await supabase.auth.updateUser({ password: parsed.data.password });
  }

  return { ok: true };
}

export async function resendInvitationAction(input: unknown): Promise<ActionResult> {
  const parsed = resendInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid invitation data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from('memberships').select('id, invited_email').eq('id', parsed.data.invitationId).single();

  if (error || !data?.invited_email) {
    return { ok: false, error: 'Invitation not found' };
  }

  await admin.auth.admin.inviteUserByEmail(data.invited_email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`,
  });

  return { ok: true };
}

export async function cancelInvitationAction(input: unknown): Promise<ActionResult> {
  const parsed = cancelInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid invitation data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc('revoke_workspace_invitation', {
    p_membership_id: parsed.data.invitationId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
