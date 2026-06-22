"use client";

import { useState } from 'react';
import { forgotPasswordAction } from '@/server-actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const result = await forgotPasswordAction({ email });
      setMessage(result.ok ? 'Password reset link sent.' : result.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={submitting} placeholder="you@consultancy.com" />
      </div>
      {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      <Button type="submit" loading={submitting} className="w-full">Send reset link</Button>
    </form>
  );
}
