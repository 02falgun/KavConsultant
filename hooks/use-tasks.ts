"use client";

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';
import { useCrmStore } from '@/store/crm';
import type { PaginatedResult, TaskRecord } from '@/lib/types/crm';

interface TasksPage {
  items: TaskRecord[];
  count: number;
  page: number;
  pageSize: number;
}

export function useTasks() {
  const scope = useCrmStore((state) => state.taskViewMode);
  const taskScope = useCrmStore((state) => state.taskScope);

  return useQuery({
    queryKey: ['tasks', scope, taskScope],
    queryFn: () => fetchJson<PaginatedResult<TaskRecord>>(`/api/tasks?page=1&pageSize=50&scope=${taskScope}`),
  });
}

export function useTasksInfinite(pageSize = 20) {
  const taskScope = useCrmStore((state) => state.taskScope);

  return useInfiniteQuery<TasksPage, Error>({
    queryKey: ['tasks', 'infinite', taskScope, pageSize],
    queryFn: ({ pageParam }) => fetchJson<TasksPage>(`/api/tasks?page=${pageParam}&pageSize=${pageSize}&scope=${taskScope}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((total, page) => total + page.items.length, 0);
      return loaded < lastPage.count ? lastPage.page + 1 : undefined;
    },
  });
}
