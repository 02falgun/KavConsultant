"use client";

import React, { useState, useTransition } from 'react';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AutomationRule = {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  actionType: string;
  status: 'active' | 'paused';
  runCount: number;
  errorCount: number;
};

export function AutomationsWorkflow() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-Assign UK Leads',
      description: 'Assigns new leads with UK preference to senior counsellor.',
      triggerType: 'student_created',
      actionType: 'assign_owner',
      status: 'active',
      runCount: 24,
      errorCount: 0,
    },
    {
      id: '2',
      name: 'Visa Document Follow-up',
      description: 'Creates document collection task when application moves to visa stage.',
      triggerType: 'student_status_changed',
      actionType: 'create_task',
      status: 'active',
      runCount: 15,
      errorCount: 1,
    },
    {
      id: '3',
      name: 'SLA Breach Alarm',
      description: 'Sends slack notification when lead is untouched for 24h.',
      triggerType: 'task_overdue',
      actionType: 'send_notification',
      status: 'paused',
      runCount: 8,
      errorCount: 0,
    }
  ]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    triggerType: 'student_created',
    actionType: 'assign_owner',
  });

  const [pending, startTransition] = useTransition();

  const handleCreateRule = () => {
    if (!form.name) return;
    const newRule: AutomationRule = {
      id: Math.random().toString(),
      name: form.name,
      description: form.description,
      triggerType: form.triggerType,
      actionType: form.actionType,
      status: 'active',
      runCount: 0,
      errorCount: 0,
    };
    setRules([...rules, newRule]);
    setForm({ name: '', description: '', triggerType: 'student_created', actionType: 'assign_owner' });
  };

  const handleToggleStatus = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

  const handleDelete = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Zap className="h-7 w-7 text-indigo-500 fill-indigo-500/10" />
          <span>Automation Rules</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Streamline consultancy operations with rule-based task creation, owner assignments, and custom reminders.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Builder Editor */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-500" />
              <span>Configure Rule Builder</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Rule Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="E.g. Auto-notify High Score Leads" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Explain what the rule executes..." />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">WHEN THIS EVENT TRIGGERS</Label>
              <select
                value={form.triggerType}
                onChange={(e) => setForm({ ...form, triggerType: e.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="student_created">Student lead profile is created</option>
                <option value="student_status_changed">Application status is changed</option>
                <option value="task_overdue">SLA response deadline is breached</option>
                <option value="payment_received">Razorpay payment invoice is paid</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">THEN EXECUTE THIS ACTION</Label>
              <select
                value={form.actionType}
                onChange={(e) => setForm({ ...form, actionType: e.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="assign_owner">Assign owner (round-robin lead distribution)</option>
                <option value="create_task">Create follow-up workflow task</option>
                <option value="send_notification">Send alert notification message</option>
                <option value="webhook_call">Trigger outbound webhook payload</option>
              </select>
            </div>

            <Button type="button" onClick={handleCreateRule} className="w-full rounded-lg h-10 gap-1.5 pt-1">
              <Plus className="h-4 w-4" />
              <span>Activate Rule</span>
            </Button>
          </CardContent>
        </Card>

        {/* Rules List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-900">
              <CardTitle className="text-md font-bold">Active Workspace Automations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-900">
              {rules.map((rule) => {
                const active = rule.status === 'active';
                return (
                  <div key={rule.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-50 text-sm">{rule.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          active
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rule.description}</p>
                      
                      {/* Sub-stats */}
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2 font-mono">
                        <span className="flex items-center gap-1"><Play className="h-3 w-3" /> Runs: {rule.runCount}</span>
                        {rule.errorCount > 0 && (
                          <span className="flex items-center gap-1 text-rose-500"><AlertTriangle className="h-3 w-3" /> Errors: {rule.errorCount}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(rule.id)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-900"
                        title={active ? 'Pause automation' : 'Resume automation'}
                      >
                        {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Historical execution logs */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Recent Rule Execution Logs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 text-xs font-mono text-slate-500 dark:text-slate-400">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span>[2026-06-12 15:32:10] RULE [Auto-Assign UK Leads] fired for student "Kavya Thakur".</span>
                <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> SUCCESS</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span>[2026-06-12 14:15:00] RULE [Visa Document Follow-up] fired for app "APP-9204".</span>
                <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> SUCCESS</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span>[2026-06-12 11:00:05] RULE [Visa Document Follow-up] failed for student UUID "e904-8fa2".</span>
                <span className="text-rose-500 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> INVALID_USER_UUID</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
