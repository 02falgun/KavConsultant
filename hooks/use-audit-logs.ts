"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import type { PaginatedResult, AuditLogRecord } from '@/lib/types/crm';

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => fetchJson<PaginatedResult<AuditLogRecord>>('/api/audit-logs?page=1&pageSize=50'),
  });
}
