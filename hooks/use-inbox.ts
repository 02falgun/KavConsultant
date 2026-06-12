"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import { useCrmStore } from '@/store/crm';
import type { PaginatedResult, InboxItem } from '@/lib/types/crm';

export function useInbox() {
  const filter = useCrmStore((state) => state.inboxFilter);

  return useQuery({
    queryKey: ['inbox', filter],
    queryFn: () => fetchJson<PaginatedResult<InboxItem>>(`/api/inbox?page=1&pageSize=50&filter=${filter}`),
  });
}
