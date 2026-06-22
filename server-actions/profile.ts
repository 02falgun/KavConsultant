"use server";

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { updateProfileSchema, changePasswordSchema } from '@/lib/validations/profile';

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

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid profile data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await ensureCurrentUser();

  const { error } = await supabase
    .from('users')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      title: parsed.data.title ?? null,
      locale: parsed.data.locale ?? null,
      timezone: parsed.data.timezone ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid password data', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await ensureCurrentUser();

  if (!user.email) {
    return { ok: false, error: 'Account email missing' };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) {
    return { ok: false, error: 'Current password incorrect' };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
