"use client";

import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Globe,
  Upload,
  Save,
  CheckCircle,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function GeneralSettingsWorkflow() {
  const [workspace, setWorkspace] = useState({
    name: 'KavConsultant Global',
    slug: 'kavconsultant-global',
    legalName: 'KavConsultant Abroad Education LLC',
    billingEmail: 'billing@kavconsultant.com',
    primaryDomain: 'kavconsultant.com',
    timezone: 'Asia/Kathmandu',
    currency: 'NPR',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Workspace general settings saved successfully.");
    }, 800);
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Settings className="h-7 w-7 text-indigo-500" />
          <span>General Settings</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure default workspace parameters, local timezones, branding details, and custom domains.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Workspace Details */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-500" />
              <span>Workspace Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Workspace Name</Label>
                <Input value={workspace.name} onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Workspace URL Slug</Label>
                <Input value={workspace.slug} onChange={(e) => setWorkspace({ ...workspace, slug: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Legal Business Name</Label>
                <Input value={workspace.legalName} onChange={(e) => setWorkspace({ ...workspace, legalName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Billing Email Address</Label>
                <Input type="email" value={workspace.billingEmail} onChange={(e) => setWorkspace({ ...workspace, billingEmail: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Primary domain mapping</Label>
              <Input value={workspace.primaryDomain} onChange={(e) => setWorkspace({ ...workspace, primaryDomain: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* Timezone and Localization */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-500" />
              <span>Localization & Timezone</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">System Timezone</Label>
              <select
                value={workspace.timezone}
                onChange={(e) => setWorkspace({ ...workspace, timezone: e.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="Europe/London">Europe/London (GMT+1)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Currency Settings</Label>
              <select
                value={workspace.currency}
                onChange={(e) => setWorkspace({ ...workspace, currency: e.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NPR">Nepalese Rupee (NPR)</option>
                <option value="INR">Indian Rupee (INR)</option>
                <option value="USD">United States Dollar (USD)</option>
                <option value="GBP">British Pound Sterling (GBP)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>Office Business Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center gap-4 text-xs">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Open time</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Close time</Label>
                <Input type="time" defaultValue="18:00" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="rounded-lg h-10 gap-1.5 px-6">
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
