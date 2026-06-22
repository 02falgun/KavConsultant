"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => fetchJson<any[]>('/api/programs'),
  });
}
