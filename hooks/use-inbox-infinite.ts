"use client";

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import { useCrmStore } from '@/store/crm';
import type { InboxItem } from '@/lib/types/crm';

interface InfiniteInboxResponse {
  items: InboxItem[];
  nextCursor: number | null;
}

export function useInboxInfinite() {
  const filter = useCrmStore((state) => state.inboxFilter);

  return useInfiniteQuery<InfiniteInboxResponse, Error>({
    queryKey: ['inbox', 'infinite', filter],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as number | null;
      const url = `/api/inbox?pageSize=15&filter=${filter}${
        cursor !== null && cursor !== undefined ? `&cursor=${cursor}` : ''
      }`;
      return fetchJson<InfiniteInboxResponse>(url);
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
