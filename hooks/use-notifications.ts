"use client";

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import type { PaginatedResult, NotificationRecord } from '@/lib/types/crm';

interface NotificationsPage {
  items: NotificationRecord[];
  count: number;
  page: number;
  pageSize: number;
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchJson<PaginatedResult<NotificationRecord>>('/api/notifications?page=1&pageSize=20'),
  });
}

export function useNotificationsInfinite(pageSize = 20) {
  return useInfiniteQuery<NotificationsPage, Error>({
    queryKey: ['notifications', 'infinite', pageSize],
    queryFn: ({ pageParam }) => fetchJson<NotificationsPage>(`/api/notifications?page=${pageParam}&pageSize=${pageSize}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((total, page) => total + page.items.length, 0);
      return loaded < lastPage.count ? lastPage.page + 1 : undefined;
    },
  });
}
