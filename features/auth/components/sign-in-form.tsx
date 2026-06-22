"use client";

import { useState } from 'react';
import Link from 'next/link';
import { loginAction, magicLinkAction } from '@/server-actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [magicPending, setMagicPending] = useState(false);

  const busy = submitting || magicPending;

  const submitPasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const result = await loginAction({ email, password });
      if (result && !result.ok) {
        setMessage(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitMagicLink = async () => {
    setMessage(null);
    setMagicPending(true);
    try {
      const result = await magicLinkAction({ email });
      setMessage(result.ok ? 'Check your email for a magic link.' : result.error);
    } finally {
      setMagicPending(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submitPasswordLogin}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} placeholder="you@consultancy.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} placeholder="••••••••" />
      </div>
      {message ? <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={submitting} disabled={busy} className="flex-1">Sign in</Button>
        <Button type="button" variant="outline" onClick={submitMagicLink} loading={magicPending} disabled={busy} className="flex-1">Magic link</Button>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <Link href="/forgot-password" className="hover:underline">Forgot password</Link>
        <Link href="/signup" className="hover:underline">Create workspace</Link>
      </div>
    </form>
  );
}
