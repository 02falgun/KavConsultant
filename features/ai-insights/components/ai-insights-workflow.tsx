"use client";

import React, { useState, useTransition } from 'react';
import {
  Sparkles,
  RefreshCw,
  Heart,
  TrendingUp,
  Brain,
  AlertCircle,
  Play,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AiInsightsWorkflow() {
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your KavConsultant AI. I analyze your lead conversion rates, counselor caseloads, and response speeds to suggest improvements. How can I assist you today?' }
  ]);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("AI Insights successfully refreshed based on current workspace metrics.");
    }, 1000);
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "I've analyzed your request. Based on current data, your Kathmandu office has the highest lead volume but Pokhara has a 12% faster visa processing speed. I recommend allocating Pokhara resources to assist with document collection bottlenecks.";
      if (userMsg.toLowerCase().includes('counsellor') || userMsg.toLowerCase().includes('staff')) {
        reply = "Counsellor Anish Sharma has 50 leads assigned with an average response time of 8 minutes, leading in conversions. Sarah Jenkins has a 72% UK student conversion rate. Recommend sharing Sarah's intake templates with the team.";
      }
      setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-500 fill-indigo-500/10" />
            <span>AI Copilot Insights</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Automatic diagnostic alerts, student health reports, and optimal follow-up recommendations.
          </p>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="rounded-lg h-9 text-xs gap-1.5 pt-1">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </Button>
      </div>

      {/* Grid: AI summary & diagnostic cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance summary */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-500" />
              <span>Workspace Diagnosis Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Analysis of <strong>June 2026</strong> metrics highlights a healthy pipeline expansion (+24% month-over-month). However, lead-to-application conversion is lagging for US-bound students compared to UK-bound students.
            </p>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex gap-3 text-xs">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-800 dark:text-amber-400 block mb-1">Document Collection Bottleneck</strong>
                Over 35% of qualified leads are waiting in the "Document Collection" stage for more than 10 days. This is the primary driver of response SLA breaches.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Health alert */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500/10" />
              <span>Lead Health Monitor</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <HealthAlert label="Critical Warning" count={3} desc="New leads untouched for 48h+" color="border-l-rose-500" />
            <HealthAlert label="Stale Alerts" count={5} desc="Applications stuck in VISA stage for 30d" color="border-l-amber-500" />
            <HealthAlert label="Healthy Flow" count={14} desc="Applicants regularly uploading docs" color="border-l-emerald-500" />
          </CardContent>
        </Card>

        {/* Recommended actions */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <span>Prescriptive Next Best Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <ActionRow text="Create bulk SMS reminder to students stuck in DOCUMENT COLLECTION." priority="HIGH Priority" />
            <ActionRow text="Re-allocate US applicant list from Elena to Sarah to optimize US admission conversion." priority="MEDIUM Priority" />
            <ActionRow text="Trigger follow-up WhatsApp for 3 visa-approved students to log enrollment letters." priority="LOW Priority" />
          </CardContent>
        </Card>

        {/* Interactive Query Assistant */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[380px]">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              <span>Query AI Copilot</span>
            </CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs custom-scrollbar">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[80%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 dark:border-slate-900 flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about workspace metrics..."
              className="h-9 text-xs rounded-lg flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
            />
            <Button size="sm" onClick={handleChatSubmit} className="h-9 text-xs rounded-lg">Send</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HealthAlert({ label, count, desc, color }: { label: string; count: number; desc: string; color: string }) {
  return (
    <div className={`p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 border-l-4 ${color} flex items-center justify-between text-xs`}>
      <div className="min-w-0 pr-2">
        <strong className="text-slate-900 dark:text-slate-100 block">{label}</strong>
        <span className="text-[10px] text-slate-400 block truncate">{desc}</span>
      </div>
      <span className="text-md font-extrabold text-slate-900 dark:text-slate-100 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg">{count}</span>
    </div>
  );
}

function ActionRow({ text, priority }: { text: string; priority: string }) {
  return (
    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-700 dark:text-slate-300 flex-1">{text}</span>
      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{priority}</span>
    </div>
  );
}
