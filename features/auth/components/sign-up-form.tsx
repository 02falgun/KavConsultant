"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signUpAction } from '@/server-actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await signUpAction({ fullName, email, password, workspaceName, workspaceSlug });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      setMessage('Workspace created. Check your email to continue.');
      router.push('/dashboard');
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Aarav Sharma" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@consultancy.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a secure password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Workspace name</Label>
        <Input id="workspaceName" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="KavConsultant Demo" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspaceSlug">Workspace slug</Label>
        <Input id="workspaceSlug" value={workspaceSlug} onChange={(event) => setWorkspaceSlug(event.target.value)} placeholder="kavconsultant-demo" />
      </div>
      {message ? <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p> : null}
      <Button type="button" onClick={submit} disabled={pending} className="w-full">Create workspace</Button>
    </div>
  );
}
