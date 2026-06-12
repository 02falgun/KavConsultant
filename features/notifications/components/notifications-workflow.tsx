"use client";

import { useQueryClient } from '@tanstack/react-query';
import { useState, useTransition } from 'react';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Circle,
  Inbox,
  Zap,
  DollarSign,
  AlertTriangle,
  Mail,
  MoreVertical,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/use-notifications';
import { useNotificationsRealtime } from '@/features/notifications/hooks/use-notifications-realtime';
import { readNotificationAction } from '@/server-actions/crm';

const iconTypes: Record<string, any> = {
  system: Zap,
  task: CheckSquare,
  application: Bell,
  payment: DollarSign,
  automation: Zap,
  mention: Mail,
  reminder: ClockIcon,
};

function ClockIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function NotificationsWorkflow() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pending, startTransition] = useTransition();
  const { data, isLoading } = useNotifications();
  useNotificationsRealtime();

  const notifications = data?.items ?? [];
  const filtered = unreadOnly ? notifications.filter((n: any) => !n.read_at) : notifications;
  const unreadCount = notifications.filter((n: any) => !n.read_at).length;

  const markRead = (notificationId: string) => {
    startTransition(async () => {
      await readNotificationAction(notificationId);
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
  };

  const markAllRead = () => {
    const unread = notifications.filter((n: any) => !n.read_at);
    if (unread.length === 0) return;
    startTransition(async () => {
      for (const item of unread) {
        await readNotificationAction(item.id);
      }
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <BellRing className="h-7 w-7 text-indigo-500" />
            <span>Realtime Feed</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with workspace changes, task assignments, and student pipeline updates.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button
            size="sm"
            onClick={markAllRead}
            disabled={pending}
            className="rounded-lg h-9 text-xs flex items-center gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {/* Toolbar filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={!unreadOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUnreadOnly(false)}
          className="h-8 text-xs rounded-md"
        >
          All Notifications
        </Button>
        <Button
          variant={unreadOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUnreadOnly(true)}
          className="h-8 text-xs rounded-md gap-1.5"
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="h-4 w-4 flex items-center justify-center bg-rose-500 text-white rounded-full text-[9px] font-extrabold">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notifications list feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
          <Inbox className="h-10 w-10 text-slate-300 mb-4" />
          <h3 className="text-md font-bold text-slate-900 dark:text-slate-50">No notifications</h3>
          <p className="text-sm text-slate-400 max-w-xs mt-1">
            You are completely caught up! We will notify you when events occur.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification: any) => {
            const isRead = !!notification.read_at;
            const Icon = iconTypes[notification.type] || Bell;

            return (
              <Card
                key={notification.id}
                className={`rounded-2xl border-slate-200 dark:border-slate-800 transition-all ${
                  isRead ? 'bg-white/50 dark:bg-slate-950/40 opacity-70' : 'bg-white dark:bg-slate-950 shadow-sm border-l-4 border-l-indigo-500'
                }`}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  {/* Category icon */}
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    isRead
                      ? 'bg-slate-100 text-slate-400 dark:bg-slate-900'
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Body details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-bold text-sm truncate ${isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-50'}`}>
                        {notification.title}
                      </h3>
                      {!isRead && (
                        <Circle className="h-2 w-2 fill-indigo-600 text-indigo-600 mt-1.5 flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {notification.body || 'System action completed.'}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Single action mark read */}
                  {!isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markRead(notification.id)}
                      className="h-8 w-8 text-slate-400 hover:text-indigo-600 rounded-lg"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
