"use client";

import { useState, useTransition } from 'react';
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
  const [pending, startTransition] = useTransition();

  const invite = () => {
    startTransition(async () => {
      const result = await inviteMemberAction({ tenantId, email, role });
      setMessage(result.ok ? 'Invitation sent.' : result.error);
      if (result.ok) {
        setInvitationId(result.data?.membershipId ?? '');
      }
    });
  };

  const resend = () => {
    startTransition(async () => {
      const result = await resendInvitationAction({ invitationId });
      setMessage(result.ok ? 'Invitation resent.' : result.error);
    });
  };

  const cancel = () => {
    startTransition(async () => {
      const result = await cancelInvitationAction({ invitationId });
      setMessage(result.ok ? 'Invitation cancelled.' : result.error);
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="space-y-2">
        <Label htmlFor="tenantId">Tenant ID</Label>
        <Input id="tenantId" value={tenantId} onChange={(event) => setTenantId(event.target.value)} placeholder="Workspace UUID" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@consultancy.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select id="role" value={role} onChange={(event) => setRole(event.target.value as (typeof AUTH_ROLES)[number])} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
          {AUTH_ROLES.map((value) => (
            <option key={value} value={value}>{value.toUpperCase()}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="invitationId">Invitation ID</Label>
        <Input id="invitationId" value={invitationId} onChange={(event) => setInvitationId(event.target.value)} placeholder="Membership UUID" />
      </div>
      {message ? <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button type="button" onClick={invite} disabled={pending}>Invite</Button>
        <Button type="button" variant="outline" onClick={resend} disabled={pending || !invitationId}>Resend</Button>
        <Button type="button" variant="ghost" onClick={cancel} disabled={pending || !invitationId}>Cancel</Button>
      </div>
    </div>
  );
}
