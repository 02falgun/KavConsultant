"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import type { PaginatedResult, NotificationRecord } from '@/lib/types/crm';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchJson<PaginatedResult<NotificationRecord>>('/api/notifications?page=1&pageSize=20'),
  });
}
