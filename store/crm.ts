"use client";

import { create } from 'zustand';
import type { InboxFilter, TaskViewMode } from '@/lib/constants/crm';

interface CrmState {
  studentSearch: string;
  applicationSearch: string;
  inboxFilter: InboxFilter;
  taskViewMode: TaskViewMode;
  taskScope: 'all' | 'my' | 'team';
  selectedApplicationStage: string | null;
  setStudentSearch: (value: string) => void;
  setApplicationSearch: (value: string) => void;
  setInboxFilter: (value: InboxFilter) => void;
  setTaskViewMode: (value: TaskViewMode) => void;
  setTaskScope: (value: 'all' | 'my' | 'team') => void;
  setSelectedApplicationStage: (value: string | null) => void;
}

export const useCrmStore = create<CrmState>((set) => ({
  studentSearch: '',
  applicationSearch: '',
  inboxFilter: 'all',
  taskViewMode: 'list',
  taskScope: 'all',
  selectedApplicationStage: null,
  setStudentSearch: (value) => set({ studentSearch: value }),
  setApplicationSearch: (value) => set({ applicationSearch: value }),
  setInboxFilter: (value) => set({ inboxFilter: value }),
  setTaskViewMode: (value) => set({ taskViewMode: value }),
  setTaskScope: (value) => set({ taskScope: value }),
  setSelectedApplicationStage: (value) => set({ selectedApplicationStage: value }),
}));
