"use client";

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import { useCrmStore } from '@/store/crm';
import type { PaginatedResult, ApplicationRecord } from '@/lib/types/crm';

interface ApplicationsPage {
  items: ApplicationRecord[];
  count: number;
  page: number;
  pageSize: number;
}

export function useApplications() {
  const search = useCrmStore((state) => state.applicationSearch);
  const selectedStage = useCrmStore((state) => state.selectedApplicationStage);

  return useQuery({
    queryKey: ['applications', search, selectedStage],
    queryFn: () => fetchJson<PaginatedResult<ApplicationRecord>>(`/api/applications?page=1&pageSize=50&search=${encodeURIComponent(search)}${selectedStage ? `&stage=${selectedStage}` : ''}`),
  });
}

export function useApplicationsInfinite(pageSize = 20) {
  const search = useCrmStore((state) => state.applicationSearch);
  const selectedStage = useCrmStore((state) => state.selectedApplicationStage);

  return useInfiniteQuery<ApplicationsPage, Error>({
    queryKey: ['applications', 'infinite', search, selectedStage, pageSize],
    queryFn: ({ pageParam }) =>
      fetchJson<ApplicationsPage>(
        `/api/applications?page=${pageParam}&pageSize=${pageSize}&search=${encodeURIComponent(search)}${selectedStage ? `&stage=${selectedStage}` : ''}`
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((total, page) => total + page.items.length, 0);
      return loaded < lastPage.count ? lastPage.page + 1 : undefined;
    },
  });
}
