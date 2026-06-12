"use client";

import type { ReactNode } from 'react';
import { useMemo, useState, useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  List,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTasks } from '@/hooks/use-tasks';
import { useCrmStore } from '@/store/crm';
import { saveTaskAction, deleteTaskAction } from '@/server-actions/crm';

const emptyForm = {
  id: '',
  title: '',
  description: '',
  status: 'open',
  priority: 'medium',
  dueAt: '',
  reminderAt: '',
  assignedUserId: '',
  studentId: '',
  applicationId: '',
};

export function TasksWorkflow() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const viewMode = useCrmStore((state) => state.taskViewMode);
  const setViewMode = useCrmStore((state) => state.setTaskViewMode);
  const scope = useCrmStore((state) => state.taskScope);
  const setScope = useCrmStore((state) => state.setTaskScope);
  
  const { data, isLoading } = useTasks();
  const tasks = data?.items ?? [];

  const byDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const task of tasks as any[]) {
      const key = task.due_at ? new Date(task.due_at).toLocaleDateString() : 'No due date';
      grouped[key] = grouped[key] ?? [];
      grouped[key].push(task);
    }
    return grouped;
  }, [tasks]);

  const submit = () => {
    if (!form.title) {
      alert("Task title is required.");
      return;
    }
    const toIsoString = (val: string) => {
      if (!val) return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date.toISOString();
    };
    startTransition(async () => {
      const result = await saveTaskAction({
        ...form,
        dueAt: toIsoString(form.dueAt),
        reminderAt: toIsoString(form.reminderAt),
      });
      if (!result.ok) {
        alert(result.error || "Failed to save task.");
        return;
      }
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });
  };

  const remove = (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    startTransition(async () => {
      await deleteTaskAction(taskId);
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });
  };

  const toggleComplete = (task: any) => {
    startTransition(async () => {
      const nextStatus = task.status === 'done' ? 'open' : 'done';
      await saveTaskAction({
        id: task.id,
        title: task.title,
        description: task.description,
        status: nextStatus,
        priority: task.priority,
        dueAt: task.due_at,
        reminderAt: task.reminder_at,
        assignedUserId: task.assigned_user_id,
        studentId: task.student_id,
        applicationId: task.application_id,
      });
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Task Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Assign workflow items, log student follow-ups, and coordinate with the team.
          </p>
        </div>

        {/* View togglers */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <Button
            size="sm"
            variant={scope === 'all' ? 'default' : 'ghost'}
            onClick={() => setScope('all')}
            className="h-8 text-xs rounded-md"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={scope === 'my' ? 'default' : 'ghost'}
            onClick={() => setScope('my')}
            className="h-8 text-xs rounded-md"
          >
            My Tasks
          </Button>
          <Button
            size="sm"
            variant={scope === 'team' ? 'default' : 'ghost'}
            onClick={() => setScope('team')}
            className="h-8 text-xs rounded-md"
          >
            Team Tasks
          </Button>
          <div className="w-[1px] bg-slate-200 dark:bg-slate-800 my-1 self-stretch" />
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => setViewMode('list')}
            className="h-8 text-xs rounded-md gap-1"
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            onClick={() => setViewMode('calendar')}
            className="h-8 text-xs rounded-md gap-1"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Calendar</span>
          </Button>
        </div>
      </div>

      {/* Task form card */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-900">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-500" />
            <span>{form.id ? 'Edit Task Details' : 'Create Task'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Title" className="md:col-span-2">
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="E.g. Call student for visa interview details" />
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>

            <Field label="Due Date">
              <Input type="datetime-local" value={form.dueAt ? form.dueAt.slice(0, 16) : ''} onChange={(event) => setForm({ ...form, dueAt: event.target.value })} />
            </Field>
            
            <Field label="Assignee ID">
              <Input value={form.assignedUserId} onChange={(event) => setForm({ ...form, assignedUserId: event.target.value })} placeholder="User UUID" />
            </Field>

            <Field label="Student ID">
              <Input value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} placeholder="Student UUID" />
            </Field>

            <Field label="Application ID">
              <Input value={form.applicationId} onChange={(event) => setForm({ ...form, applicationId: event.target.value })} placeholder="Application UUID" />
            </Field>

            <Field label="Description" className="md:col-span-4">
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="w-full min-h-[80px] p-3 text-sm rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
                placeholder="Details of the checklist and next actions..."
              />
            </Field>
          </div>

          <div className="mt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-900 pt-4">
            <Button type="button" onClick={submit} disabled={pending} className="px-6">
              {form.id ? 'Save Changes' : 'Create Task'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Calendar view OR List view */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
          <CheckCircle className="h-10 w-10 text-emerald-500 mb-4 animate-bounce" />
          <h3 className="text-md font-bold text-slate-900 dark:text-slate-50 font-sans">No tasks found</h3>
          <p className="text-sm text-slate-400 max-w-xs mt-1">
            Excellent! Your schedule is completely clear of pending tasks.
          </p>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar view columns */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(byDate).map(([date, dateTasks]) => (
            <Card key={date} className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <CardHeader className="border-b border-slate-100 dark:border-slate-900 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>{date}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {dateTasks.map((task: any) => {
                  const done = task.status === 'done';
                  return (
                    <div
                      key={task.id}
                      className={`rounded-xl border p-3 bg-white dark:bg-slate-950 relative ${
                        done ? 'border-slate-100 opacity-60' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggleComplete(task)}
                          className="h-4 w-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate ${
                            done ? 'line-through text-slate-400' : ''
                          }`}>
                            {task.title}
                          </span>
                          <span className={`inline-flex px-1.5 py-0.5 mt-2 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                            task.priority === 'urgent' || task.priority === 'high'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-900'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List view list rows */
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="space-y-3">
            {tasks.map((task: any) => {
              const done = task.status === 'done';
              return (
                <div
                  key={task.id}
                  className={`flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between transition-colors ${
                    done
                      ? 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 opacity-60'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 bg-white dark:bg-slate-950'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleComplete(task)}
                      className="h-5 w-5 mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className={`font-semibold text-slate-900 dark:text-slate-100 text-sm block ${
                        done ? 'line-through text-slate-400' : ''
                      }`}>
                        {task.title}
                      </span>
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-xl">
                        {task.description || 'No additional details provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    {task.due_at && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(task.due_at).toLocaleDateString()}</span>
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      task.priority === 'urgent' || task.priority === 'high'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-900'
                    }`}>
                      {task.priority}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      {task.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm({
                        id: task.id,
                        title: task.title,
                        description: task.description ?? '',
                        status: task.status,
                        priority: task.priority,
                        dueAt: task.due_at ?? '',
                        reminderAt: task.reminder_at ?? '',
                        assignedUserId: task.assigned_user_id ?? '',
                        studentId: task.student_id ?? '',
                        applicationId: task.application_id ?? ''
                      })}
                      className="h-8 text-xs gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(task.id)}
                      className="h-8 text-xs text-slate-400 hover:text-rose-500 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}
