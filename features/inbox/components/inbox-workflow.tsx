"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Phone,
  MessageCircle,
  UserPlus,
  ExternalLink,
  Clock,
  AlertCircle,
  AlertOctagon,
  Calendar,
  Sparkles,
  Search,
  CheckCircle,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInbox } from '@/hooks/use-inbox';
import { useCrmStore } from '@/store/crm';
import { logCrmActivityAction, assignStudentCounsellorAction } from '@/server-actions/crm';

const labels: Record<string, string> = {
  all: 'All Items',
  new: 'New Leads',
  due_today: 'Due Today',
  overdue: 'Overdue Tasks',
  unreachable: 'Unreachable',
  stale: 'Stale Leads',
};

export function InboxWorkflow() {
  const router = useRouter();
  const filter = useCrmStore((state) => state.inboxFilter);
  const setFilter = useCrmStore((state) => state.setInboxFilter);
  const { data, isLoading } = useInbox();
  const [pending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const items = data?.items ?? [];

  const handleLogCall = (itemId: string, itemType: 'student' | 'task', title: string) => {
    startTransition(async () => {
      await logCrmActivityAction({
        activityType: 'call',
        subject: `Outgoing call to ${title}`,
        description: 'Call placed from SMART Inbox.',
        studentId: itemType === 'student' ? itemId : undefined,
      });
      alert(`Call logged successfully for: ${title}`);
      await queryClient.invalidateQueries({ queryKey: ['inbox'] });
    });
  };

  const handleLogWhatsApp = (itemId: string, itemType: 'student' | 'task', title: string) => {
    startTransition(async () => {
      await logCrmActivityAction({
        activityType: 'whatsapp',
        subject: `WhatsApp message sent to ${title}`,
        description: 'WhatsApp interaction initiated from SMART Inbox.',
        studentId: itemType === 'student' ? itemId : undefined,
      });
      const whatsappUrl = `https://wa.me/?text=Hello%20${encodeURIComponent(title)}`;
      window.open(whatsappUrl, '_blank');
      await queryClient.invalidateQueries({ queryKey: ['inbox'] });
    });
  };

  const handleAssign = (studentId: string, title: string) => {
    const counsellorId = prompt("Enter Counsellor User UUID to assign:");
    if (!counsellorId) return;

    startTransition(async () => {
      const result = await assignStudentCounsellorAction({
        studentId,
        counsellorId,
      });
      if (result.ok) {
        alert(`Assigned ${title} successfully.`);
        await queryClient.invalidateQueries({ queryKey: ['inbox'] });
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          SMART Inbox
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Combined priority workflow queue prioritizing urgent tasks, new signups, and follow-ups.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {Object.entries(labels).map(([key, label]) => (
          <Button
            key={key}
            type="button"
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key as any)}
            className="rounded-lg text-xs h-9 px-4"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Inbox Feed Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full mb-4">
            <Inbox className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-md font-semibold text-slate-900 dark:text-slate-50">Your inbox is clear</h3>
          <p className="text-sm text-slate-400 max-w-xs mt-1">
            No items matching this filter require attention right now.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item: any) => {
            const isTask = item.type === 'task';
            const isOverdue = item.filter === 'overdue';
            const isStale = item.filter === 'stale';

            return (
              <Card
                key={item.id}
                className={`rounded-2xl border-slate-200 dark:border-slate-800 transition-all hover:shadow-md ${
                  isOverdue ? 'border-l-4 border-l-red-500' : isTask ? 'border-l-4 border-l-indigo-500' : 'border-l-4 border-l-teal-500'
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top indicators */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isTask
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400'
                      }`}>
                        {item.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        item.priority === 'urgent' || item.priority === 'high'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-slate-400 gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {item.due_at ? new Date(item.due_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Body text */}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-50 text-md leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.student_name ? `Student: ${item.student_name}` : 'No student linked'}</span>
                      {item.assignee_name && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>Assignee: {item.assignee_name}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-900">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLogCall(item.id, item.type, item.student_name || item.title)}
                      className="rounded-lg h-8 text-xs flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLogWhatsApp(item.id, item.type, item.student_name || item.title)}
                      className="rounded-lg h-8 text-xs flex items-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </Button>

                    {!isTask && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssign(item.id, item.student_name || item.title)}
                        className="rounded-lg h-8 text-xs flex items-center gap-1.5 hover:bg-purple-50 dark:hover:bg-purple-950"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Assign</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        router.push(isTask ? `/tasks` : `/students`);
                      }}
                      className="rounded-lg h-8 text-xs ml-auto flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
