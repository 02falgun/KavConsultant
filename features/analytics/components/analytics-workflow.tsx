"use client";

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  BarChart3,
  Download,
  Filter,
  FileText,
  Bookmark,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LeadConversionPoint = { date: string; leads: number; applications: number; enrollments: number };
type CounselorPerformancePoint = { name: string; leads: number; conversions: number };
type SavedReport = { title: string; description: string };

export function AnalyticsWorkflow() {
  const [dateRange, setDateRange] = useState('30d');

  // No analytics data is generated yet on a fresh workspace.
  const leadConversionData: LeadConversionPoint[] = [];
  const counselorPerformance: CounselorPerformancePoint[] = [];
  const savedReports: SavedReport[] = [];

  const hasConversionData = leadConversionData.length > 0;
  const hasPerformanceData = counselorPerformance.length > 0;

  const handleExportCSV = () => {
    if (!hasConversionData && !hasPerformanceData) {
      alert('No analytics data to export yet.');
      return;
    }
    alert('Exporting analytics metrics in CSV format...');
  };

  const handleExportPDF = () => {
    if (!hasConversionData && !hasPerformanceData) {
      alert('No analytics data to export yet.');
      return;
    }
    alert('Exporting analytics report as print-ready PDF...');
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-500" />
            <span>Workspace Analytics</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Generate custom conversion reports, compare advisor performance, and monitor team response speed.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="h-9 text-xs rounded-lg gap-1.5">
            <Download className="h-4 w-4" />
            <span>CSV</span>
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="h-9 text-xs rounded-lg gap-1.5">
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </Button>
        </div>
      </div>

      {/* Date filter toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2 shadow-sm">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 mr-2">Scope:</span>
        <Button size="sm" variant={dateRange === '7d' ? 'default' : 'ghost'} onClick={() => setDateRange('7d')} className="h-8 text-xs rounded">Last 7 Days</Button>
        <Button size="sm" variant={dateRange === '30d' ? 'default' : 'ghost'} onClick={() => setDateRange('30d')} className="h-8 text-xs rounded">Last 30 Days</Button>
        <Button size="sm" variant={dateRange === '90d' ? 'default' : 'ghost'} onClick={() => setDateRange('90d')} className="h-8 text-xs rounded">Last 90 Days</Button>
      </div>

      {/* Grid: Charts & Saved Reports */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lead Conversion Line Chart */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <span>Full Conversion Lifecycle</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {hasConversionData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadConversionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="enrollments" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No conversion data yet. Metrics will appear as leads and applications are created." />
            )}
          </CardContent>
        </Card>

        {/* Saved Reports Directory */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-indigo-500" />
              <span>Saved Reports Quick Links</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {savedReports.length === 0 ? (
              <div className="py-10 text-center">
                <Bookmark className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-xs text-slate-400">No saved reports yet.</p>
              </div>
            ) : (
              savedReports.map((report) => (
                <ReportLink key={report.title} title={report.title} description={report.description} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Counselor performance comparison */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-indigo-500" />
              <span>Counselor Conversion Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {hasPerformanceData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={counselorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} name="Assigned Leads" />
                  <Bar dataKey="conversions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} name="Successful Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No counselor performance data yet. Assign leads to your team to populate this chart." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <BarChart3 className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
      <p className="text-sm text-slate-400 max-w-xs">{message}</p>
    </div>
  );
}

function ReportLink({ title, description }: { title: string; description: string }) {
  return (
    <button
      onClick={() => alert(`Opening report: ${title}`)}
      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 flex items-center justify-between text-left text-xs transition-colors bg-white dark:bg-slate-950"
    >
      <div>
        <p className="font-bold text-slate-900 dark:text-slate-100">{title}</p>
        <span className="text-[10px] text-slate-400 block pt-0.5">{description}</span>
      </div>
    </button>
  );
}
