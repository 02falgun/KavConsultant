"use client";

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import { useCrmStore } from '@/store/crm';
import type { PaginatedResult, StudentRecord } from '@/lib/types/crm';

interface InfiniteStudentsResponse {
  items: StudentRecord[];
  nextCursor: { createdAt: string; id: string } | null;
}

export function useStudents() {
  const search = useCrmStore((state) => state.studentSearch);

  return useQuery({
    queryKey: ['students', search],
    queryFn: () => fetchJson<PaginatedResult<StudentRecord>>(`/api/students?page=1&pageSize=20&search=${encodeURIComponent(search)}`),
  });
}

export function useStudentsInfinite(params: { search?: string; status?: string; pageSize?: number } = {}) {
  const pageSize = params.pageSize ?? 20;

  return useInfiniteQuery<InfiniteStudentsResponse, Error>({
    queryKey: ['students', 'infinite', params.search, params.status, pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as { createdAt: string; id: string } | null;
      const searchParam = params.search ? `&search=${encodeURIComponent(params.search)}` : '';
      const statusParam = params.status ? `&status=${encodeURIComponent(params.status)}` : '';
      const cursorParams = cursor
        ? `&cursorCreatedAt=${encodeURIComponent(cursor.createdAt)}&cursorId=${encodeURIComponent(cursor.id)}`
        : '';

      const url = `/api/students?pageSize=${pageSize}${searchParam}${statusParam}${cursorParams}`;
      return fetchJson<InfiniteStudentsResponse>(url);
    },
    initialPageParam: null as { createdAt: string; id: string } | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
