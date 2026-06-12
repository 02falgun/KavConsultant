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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setFieldErrors(null);
    setMessage(null);
    startTransition(async () => {
      const result = await signUpAction({ fullName, email, password, workspaceName, workspaceSlug });
      if (!result.ok) {
        setMessage(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        return;
      }

      setMessage('Workspace created. Redirecting...');
      router.push('/dashboard');
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Aarav Sharma" />
        {fieldErrors?.fullName && (
          <p className="text-xs text-rose-500 font-semibold">{fieldErrors.fullName[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@consultancy.com" />
        {fieldErrors?.email && (
          <p className="text-xs text-rose-500 font-semibold">{fieldErrors.email[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a secure password" />
        {fieldErrors?.password && (
          <p className="text-xs text-rose-500 font-semibold">{fieldErrors.password[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Workspace name</Label>
        <Input id="workspaceName" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="KavConsultant Demo" />
        {fieldErrors?.workspaceName && (
          <p className="text-xs text-rose-500 font-semibold">{fieldErrors.workspaceName[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspaceSlug">Workspace slug</Label>
        <Input id="workspaceSlug" value={workspaceSlug} onChange={(event) => setWorkspaceSlug(event.target.value)} placeholder="kavconsultant-demo" />
        {fieldErrors?.workspaceSlug && (
          <p className="text-xs text-rose-500 font-semibold">{fieldErrors.workspaceSlug[0]}</p>
        )}
      </div>
      {message && !fieldErrors ? <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p> : null}
      <Button type="button" onClick={submit} disabled={pending} className="w-full">Create workspace</Button>
    </div>
  );
}
