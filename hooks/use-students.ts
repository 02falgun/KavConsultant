"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import { useCrmStore } from '@/store/crm';
import type { PaginatedResult, StudentRecord } from '@/lib/types/crm';

export function useStudents() {
  const search = useCrmStore((state) => state.studentSearch);

  return useQuery({
    queryKey: ['students', search],
    queryFn: () => fetchJson<PaginatedResult<StudentRecord>>(`/api/students?page=1&pageSize=20&search=${encodeURIComponent(search)}`),
  });
}
