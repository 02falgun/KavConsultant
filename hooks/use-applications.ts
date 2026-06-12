"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import { useCrmStore } from '@/store/crm';
import type { PaginatedResult, ApplicationRecord } from '@/lib/types/crm';

export function useApplications() {
  const search = useCrmStore((state) => state.applicationSearch);
  const selectedStage = useCrmStore((state) => state.selectedApplicationStage);

  return useQuery({
    queryKey: ['applications', search, selectedStage],
    queryFn: () => fetchJson<PaginatedResult<ApplicationRecord>>(`/api/applications?page=1&pageSize=50&search=${encodeURIComponent(search)}${selectedStage ? `&stage=${selectedStage}` : ''}`),
  });
}
