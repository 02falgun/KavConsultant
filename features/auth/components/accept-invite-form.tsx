"use client";

import { useState } from 'react';
import { acceptInvitationAction } from '@/server-actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AcceptInviteForm() {
  const [invitationId, setInvitationId] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const result = await acceptInvitationAction({ invitationId, token, password: password || undefined });
      setMessage(result.ok ? 'Invitation accepted.' : result.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="invitationId">Invitation ID</Label>
        <Input id="invitationId" value={invitationId} onChange={(event) => setInvitationId(event.target.value)} disabled={submitting} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="token">Token</Label>
        <Input id="token" value={token} onChange={(event) => setToken(event.target.value)} disabled={submitting} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password (optional)</Label>
        <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} />
      </div>
      {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      <Button type="submit" loading={submitting} className="w-full">Accept invitation</Button>
    </form>
  );
}
