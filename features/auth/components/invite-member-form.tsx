"use client";

import { useState } from 'react';
import { inviteMemberAction, resendInvitationAction, cancelInvitationAction } from '@/server-actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AUTH_ROLES } from '@/lib/constants/auth';

export function InviteMemberForm() {
  const [tenantId, setTenantId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<(typeof AUTH_ROLES)[number]>('counsellor');
  const [invitationId, setInvitationId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [invitePending, setInvitePending] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [cancelPending, setCancelPending] = useState(false);

  const busy = invitePending || resendPending || cancelPending;

  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setInvitePending(true);
    try {
      const result = await inviteMemberAction({ tenantId, email, role });
      setMessage(result.ok ? 'Invitation sent.' : result.error);
      if (result.ok) {
        setInvitationId(result.data?.membershipId ?? '');
      }
    } finally {
      setInvitePending(false);
    }
  };

  const resend = async () => {
    setMessage(null);
    setResendPending(true);
    try {
      const result = await resendInvitationAction({ invitationId });
      setMessage(result.ok ? 'Invitation resent.' : result.error);
    } finally {
      setResendPending(false);
    }
  };

  const cancel = async () => {
    setMessage(null);
    setCancelPending(true);
    try {
      const result = await cancelInvitationAction({ invitationId });
      setMessage(result.ok ? 'Invitation cancelled.' : result.error);
    } finally {
      setCancelPending(false);
    }
  };

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950" onSubmit={invite}>
      <div className="space-y-2">
        <Label htmlFor="tenantId">Tenant ID</Label>
        <Input id="tenantId" value={tenantId} onChange={(event) => setTenantId(event.target.value)} disabled={busy} placeholder="Workspace UUID" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} placeholder="teammate@consultancy.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select id="role" value={role} onChange={(event) => setRole(event.target.value as (typeof AUTH_ROLES)[number])} disabled={busy} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950">
          {AUTH_ROLES.map((value) => (
            <option key={value} value={value}>{value.toUpperCase()}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="invitationId">Invitation ID</Label>
        <Input id="invitationId" value={invitationId} onChange={(event) => setInvitationId(event.target.value)} disabled={busy} placeholder="Membership UUID" />
      </div>
      {message ? <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button type="submit" loading={invitePending} disabled={busy}>Invite</Button>
        <Button type="button" variant="outline" onClick={resend} loading={resendPending} disabled={busy || !invitationId}>Resend</Button>
        <Button type="button" variant="ghost" onClick={cancel} loading={cancelPending} disabled={busy || !invitationId}>Cancel</Button>
      </div>
    </form>
  );
}
