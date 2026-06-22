"use client";

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import type { PaginatedResult, AuditLogRecord } from '@/lib/types/crm';

interface AuditLogsPage {
  items: AuditLogRecord[];
  count: number;
  page: number;
  pageSize: number;
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => fetchJson<PaginatedResult<AuditLogRecord>>('/api/audit-logs?page=1&pageSize=50'),
  });
}

export function useAuditLogsInfinite(pageSize = 20) {
  return useInfiniteQuery<AuditLogsPage, Error>({
    queryKey: ['audit-logs', 'infinite', pageSize],
    queryFn: ({ pageParam }) => fetchJson<AuditLogsPage>(`/api/audit-logs?page=${pageParam}&pageSize=${pageSize}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((total, page) => total + page.items.length, 0);
      return loaded < lastPage.count ? lastPage.page + 1 : undefined;
    },
  });
}
