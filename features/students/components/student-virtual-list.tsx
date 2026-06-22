"use client";

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StudentRecord } from '@/lib/types/crm';

interface StudentVirtualListProps {
  students: (StudentRecord & Record<string, any>)[];
  onEdit: (student: StudentRecord & Record<string, any>) => void;
  onDelete: (id: string) => void;
}

export function StudentVirtualList({ students, onEdit, onDelete }: StudentVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Configure row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated height of each row in px
    overscan: 6, // Renders 6 items outside the view area to guarantee smooth scroll transitions
  });

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
      {/* Table Head - CSS Grid based */}
      <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_1fr] bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider py-3.5 px-4 select-none">
        <div>Name</div>
        <div>Contact</div>
        <div>Status</div>
        <div>Country</div>
        <div className="text-center">Score</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Scrollable container with fixed height */}
      <div
        ref={parentRef}
        className="h-[520px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200"
      >
        {/* Virtualized scroll track */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const student = students[virtualRow.index];
            if (!student) return null;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_1fr] items-center border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/55 dark:hover:bg-slate-900/30 px-4 transition-colors"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {/* Name */}
                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
                  {student.full_name}
                </div>

                {/* Contact */}
                <div className="flex flex-col truncate pr-2">
                  <span className="text-slate-850 dark:text-slate-200 text-xs">{student.email ?? '—'}</span>
                  <span className="text-slate-400 text-[10px]">{student.phone ?? '—'}</span>
                </div>

                {/* Status */}
                <div>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {student.status}
                  </span>
                </div>

                {/* Country */}
                <div className="text-slate-600 dark:text-slate-400 text-xs truncate pr-2">
                  {student.preferred_country || '—'}
                </div>

                {/* Score */}
                <div className="text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    student.lead_score > 70
                      ? 'bg-rose-55 text-rose-600 dark:bg-rose-950/30'
                      : student.lead_score > 40
                      ? 'bg-amber-55 text-amber-600 dark:bg-amber-950/30'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  }`}>
                    {student.lead_score}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(student)}
                    className="h-8 w-8 text-slate-500 hover:text-slate-900"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(student.id)}
                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
