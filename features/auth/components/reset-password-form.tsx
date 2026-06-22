"use client";

import { useState } from 'react';
import { resetPasswordAction } from '@/server-actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const result = await resetPasswordAction({ password, confirmPassword });
      setMessage(result.ok ? 'Password updated.' : result.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={submitting} />
      </div>
      {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      <Button type="submit" loading={submitting} className="w-full">Reset password</Button>
    </form>
  );
}
