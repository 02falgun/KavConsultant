"use client";

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  UserCheck,
  Zap,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/use-dashboard';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export function DashboardWorkflow() {
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    source: '',
    counsellor: '',
    stage: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, refetch, isFetching } = useDashboard(filters);

  if (!mounted) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis ?? {
    newLeads: 0,
    conversionRate: 0,
    slaCompliance: 0,
    avgResponseTime: '0m',
    activePipeline: 0,
    wonApplications: 0,
    overdueTasks: 0,
    staleLeads: 0,
  };

  const charts = data?.charts ?? {
    pipelineTrend: [],
    sourceBreakdown: [],
    countryConversion: [],
    responseTimeDistribution: [],
  };

  const handleResetFilters = () => {
    setFilters({ country: '', source: '', counsellor: '', stage: '' });
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Workspace Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Realtime performance overview, lead pipelines, and team metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg h-10 w-10 flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <select
          value={filters.country}
          onChange={(event) => setFilters({ ...filters, country: event.target.value })}
          className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-xs focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Countries</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="Germany">Germany</option>
        </select>

        <select
          value={filters.source}
          onChange={(event) => setFilters({ ...filters, source: event.target.value })}
          className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-xs focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Sources</option>
          <option value="organic">Organic</option>
          <option value="paid_ads">Paid Ads</option>
          <option value="referral">Referral</option>
          <option value="website">Website</option>
          <option value="whatsapp">WhatsApp</option>
        </select>

        <select
          value={filters.stage}
          onChange={(event) => setFilters({ ...filters, stage: event.target.value })}
          className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-xs focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Stages</option>
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="applied">Applied</option>
          <option value="offer_received">Offer Received</option>
          <option value="visa">Visa</option>
          <option value="enrolled">Enrolled</option>
        </select>

        {(filters.country || filters.source || filters.counsellor || filters.stage) && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs text-indigo-600 dark:text-indigo-400">
            Clear Filters
          </Button>
        )}
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <KpiCard title="New Leads" value={kpis.newLeads} icon={Users} description="Active new signups" color="text-blue-500" />
          <KpiCard title="Conversion Rate" value={`${kpis.conversionRate}%`} icon={TrendingUp} description="Lead-to-enrollment ratio" color="text-indigo-500" />
          <KpiCard title="SLA Compliance" value={`${kpis.slaCompliance}%`} icon={CheckCircle} description="Response SLA met" color="text-emerald-500" />
          <KpiCard title="Avg Response Time" value={kpis.avgResponseTime} icon={Clock} description="First action speed" color="text-amber-500" />
          <KpiCard title="Active Pipeline" value={kpis.activePipeline} icon={Activity} description="Applications in progress" color="text-purple-500" />
          <KpiCard title="Won Applications" value={kpis.wonApplications} icon={UserCheck} description="Students enrolled/accepted" color="text-teal-500" />
          <KpiCard title="Overdue Tasks" value={kpis.overdueTasks} icon={AlertTriangle} description="Pending task alerts" color="text-red-500" />
          <KpiCard title="Stale Leads" value={kpis.staleLeads} icon={Zap} description="Inactive for 30+ days" color="text-slate-500" />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline Trend Chart */}
        <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <span>Pipeline Growth Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.pipelineTrend}>
                <defs>
                  <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPipeline)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources Breakdown (Pie Chart) */}
        <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              <span>Lead Source Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {charts.sourceBreakdown.length === 0 ? (
              <p className="text-slate-400 text-sm">No source data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.sourceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.sourceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Country Conversion Rate Bar Chart */}
        <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <span>Conversion Rate by Destination</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.countryConversion} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} />
                <YAxis dataKey="country" type="category" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Distribution Bar Chart */}
        <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              <span>Response Time Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.responseTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
};

function KpiCard({ title, value, icon: Icon, description, color }: KpiCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
          <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{value}</span>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
