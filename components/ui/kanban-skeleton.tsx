import React from 'react';

export function KanbanBoardSkeleton() {
  // We simulate 4 columns corresponding to pipeline stages
  const columns = ['New', 'Qualified', 'Document Collection', 'Applied'];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-900 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Editor Skeleton Card */}
      <div className="h-44 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/30 dark:bg-slate-950/10 space-y-4">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg" />
          <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg" />
          <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg" />
          <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg" />
        </div>
      </div>

      {/* Kanban Board Columns Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 overflow-x-auto pb-4">
        {columns.map((columnName, colIdx) => (
          <div
            key={colIdx}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 min-w-[250px] space-y-4 h-[550px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {columnName}
              </span>
              <span className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>

            {/* Column Cards Skeletons */}
            <div className="space-y-3">
              {[...Array(3 - colIdx)].map((_, cardIdx) => (
                <div
                  key={cardIdx}
                  className="rounded-xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 p-4 space-y-3 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-4 bg-slate-100 dark:bg-slate-900 rounded" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded" />
                    <div className="h-3 w-40 bg-slate-100 dark:bg-slate-900 rounded" />
                    <div className="h-3 w-28 bg-slate-100 dark:bg-slate-900 rounded" />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-900">
                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
