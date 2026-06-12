"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import { useCrmStore } from '@/store/crm';
import type { PaginatedResult, TaskRecord } from '@/lib/types/crm';

export function useTasks() {
  const scope = useCrmStore((state) => state.taskViewMode);
  const taskScope = useCrmStore((state) => state.taskScope);

  return useQuery({
    queryKey: ['tasks', scope, taskScope],
    queryFn: () => fetchJson<PaginatedResult<TaskRecord>>(`/api/tasks?page=1&pageSize=50&scope=${taskScope}`),
  });
}
