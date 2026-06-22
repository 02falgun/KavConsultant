"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Globe, Lock, Save, ShieldCheck, CheckCircle2, AlertCircle, Building2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfileAction, changePasswordAction } from '@/server-actions/profile';

type ProfileFields = {
  fullName: string;
  phone: string;
  title: string;
  locale: string;
  timezone: string;
};

type ProfileSettingsWorkflowProps = {
  role: string;
  tenantId: string;
  email: string;
  avatarUrl: string;
  initialProfile: ProfileFields;
};

type Feedback = { type: 'success' | 'error'; message: string } | null;

const LOCALE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'ne-NP', label: 'Nepali (Nepal)' },
  { value: 'hi-IN', label: 'Hindi (India)' },
];

const TIMEZONE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (GMT+5:45)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+1)' },
];

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  const success = feedback.type === 'success';
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
        success
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
      }`}
    >
      {success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <span>{feedback.message}</span>
    </div>
  );
}

export function ProfileSettingsWorkflow({ role, tenantId, email, avatarUrl, initialProfile }: ProfileSettingsWorkflowProps) {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileFields>(initialProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyTenant = async () => {
    try {
      await navigator.clipboard.writeText(tenantId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  const initials = (profile.fullName || email || 'U').charAt(0).toUpperCase();

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileFeedback(null);
    setSavingProfile(true);
    try {
      const result = await updateProfileAction(profile);
      if (result.ok) {
        setProfileFeedback({ type: 'success', message: 'Profile updated successfully.' });
        router.refresh();
      } else {
        setProfileFeedback({ type: 'error', message: result.error });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordFeedback(null);
    setSavingPassword(true);
    try {
      const result = await changePasswordAction(passwords);
      if (result.ok) {
        setPasswordFeedback({ type: 'success', message: 'Password changed successfully.' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordFeedback({ type: 'error', message: result.error });
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <User className="h-7 w-7 text-indigo-500" />
          <span>My Profile</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, contact information, and account password.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 dark:text-slate-50 truncate">{profile.fullName || 'Unnamed user'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <ShieldCheck className="h-3 w-3" />
              {role}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <span>Workspace ID (Tenant UUID)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-2">
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {tenantId}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyTenant}
              className="rounded-lg h-10 gap-1.5 px-4 flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use this ID when inviting team members in Settings &gt; Team Management.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleProfileSubmit}>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-500" />
              <span>Profile Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Full Name</Label>
                <Input
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  disabled={savingProfile}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Email (read-only)</Label>
                <Input value={email} disabled readOnly />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Phone Number</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={savingProfile}
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Job Title</Label>
                <Input
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  disabled={savingProfile}
                  placeholder="Senior Counsellor"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400 flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Locale
                </Label>
                <select
                  value={profile.locale}
                  onChange={(e) => setProfile({ ...profile, locale: e.target.value })}
                  disabled={savingProfile}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
                >
                  {LOCALE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400 flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Timezone
                </Label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  disabled={savingProfile}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
                >
                  {TIMEZONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <FeedbackBanner feedback={profileFeedback} />

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={savingProfile} className="rounded-lg h-10 gap-1.5 px-6">
                {!savingProfile && <Save className="h-4 w-4" />}
                <span>Save Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <form onSubmit={handlePasswordSubmit}>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-500" />
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Current Password</Label>
              <Input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                disabled={savingPassword}
                autoComplete="current-password"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">New Password</Label>
                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  disabled={savingPassword}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  disabled={savingPassword}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <FeedbackBanner feedback={passwordFeedback} />

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={savingPassword} variant="outline" className="rounded-lg h-10 gap-1.5 px-6">
                {!savingPassword && <Lock className="h-4 w-4" />}
                <span>Update Password</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
