"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';

type DashboardData = {
  kpis: {
    newLeads: number;
    conversionRate: number;
    slaCompliance: number;
    avgResponseTime: string;
    activePipeline: number;
    wonApplications: number;
    overdueTasks: number;
    staleLeads: number;
  };
  charts: {
    pipelineTrend: Array<{ name: string; count: number }>;
    sourceBreakdown: Array<{ name: string; value: number }>;
    countryConversion: Array<{ country: string; rate: number }>;
    responseTimeDistribution: Array<{ range: string; count: number }>;
  };
};

export function useDashboard(filters: {
  country: string;
  source: string;
  counsellor: string;
  stage: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters.country) queryParams.set('country', filters.country);
  if (filters.source) queryParams.set('source', filters.source);
  if (filters.counsellor) queryParams.set('counsellor', filters.counsellor);
  if (filters.stage) queryParams.set('stage', filters.stage);

  return useQuery<DashboardData>({
    queryKey: ['dashboard', filters],
    queryFn: () => fetchJson<DashboardData>(`/api/dashboard?${queryParams.toString()}`),
  });
}
