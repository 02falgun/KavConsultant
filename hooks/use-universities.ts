"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/utils/fetch-json';

export function useUniversities() {
  return useQuery({
    queryKey: ['universities'],
    queryFn: () => fetchJson<any[]>('/api/universities'),
  });
}
