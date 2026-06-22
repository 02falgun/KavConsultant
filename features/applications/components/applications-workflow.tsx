"use client";

import type { ReactNode } from 'react';
import { useMemo, useState, useTransition, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Plus,
  LayoutGrid,
  List,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckSquare,
  AlertTriangle,
  MoveRight,
  User,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APPLICATION_PIPELINE_STAGES, applicationStageLabel, type ApplicationPipelineStage, getDatabaseStatusForStage } from '@/lib/workflow/stages';
import { useApplicationsInfinite } from '@/hooks/use-applications';
import { useStudents } from '@/hooks/use-students';
import { useUniversities } from '@/hooks/use-universities';
import { usePrograms } from '@/hooks/use-programs';
import { useCrmStore } from '@/store/crm';
import { saveApplicationAction, updateApplicationStageAction, deleteApplicationAction } from '@/server-actions/crm';
import type { ApplicationRecord } from '@/lib/types/crm';

const emptyForm = {
  id: '',
  studentId: '',
  universityId: '',
  programId: '',
  applicationNumber: '',
  stage: 'new' as ApplicationPipelineStage,
  intakeTerm: '',
  intakeYear: '',
  feeAmount: '',
  notes: '',
  assignedCounsellorId: '',
  branchId: '',
};

export function ApplicationsWorkflow() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  
  const search = useCrmStore((state) => state.applicationSearch);
  const setSearch = useCrmStore((state) => state.setApplicationSearch);
  const selectedStage = useCrmStore((state) => state.selectedApplicationStage);
  const setSelectedStage = useCrmStore((state) => state.setSelectedApplicationStage);
  
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useApplicationsInfinite();
  const { data: studentsData } = useStudents();
  const { data: unis } = useUniversities();
  const { data: progs } = usePrograms();

  const applications = data?.pages.flatMap((page) => page.items) ?? [];
  const studentsList = studentsData?.items ?? [];

  const filteredApps = useMemo(() => {
    return applications.filter((app: any) => {
      const matchSearch = search
        ? app.application_number.toLowerCase().includes(search.toLowerCase()) ||
          app.students?.full_name?.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchStage = selectedStage ? (app.stage || app.status) === selectedStage : true;
      return matchSearch && matchStage;
    });
  }, [applications, search, selectedStage]);

  const grouped = useMemo(() => {
    const result = Object.fromEntries(APPLICATION_PIPELINE_STAGES.map((stage) => [stage, [] as ApplicationRecord[]]));
    for (const app of filteredApps) {
      const stage = ((app as Record<string, any>).stage ?? app.status) as ApplicationPipelineStage;
      (result[stage] ?? result.new).push(app as ApplicationRecord);
    }
    return result as Record<ApplicationPipelineStage, ApplicationRecord[]>;
  }, [filteredApps]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.studentId || !form.universityId || !form.programId || !form.applicationNumber) {
      alert("Please enter Student ID, University ID, Program ID, and Application Number.");
      return;
    }
    setSaving(true);
    try {
      const result = await saveApplicationAction(form);
      if (!result.ok) {
        alert(result.error || "Failed to save application.");
        return;
      }
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
    } finally {
      setSaving(false);
    }
  };

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: ApplicationPipelineStage }) => {
      const result = await updateApplicationStageAction(id, stage);
      if (!result.ok) {
        throw new Error(result.error || 'Failed to update application stage');
      }
      return result.data;
    },
    onMutate: async ({ id, stage }) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: ['applications'] });

      // Snapshot current cache state
      const previousQueries = queryClient.getQueriesData<any>({ queryKey: ['applications'] });

      // Optimistically update caches
      previousQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<any>(queryKey, (old: any) => {
          if (!old || !old.items) return old;
          return {
            ...old,
            items: old.items.map((item: any) => {
              if (item.id === id) {
                return {
                  ...item,
                  status: getDatabaseStatusForStage(stage),
                  stage: stage
                };
              }
              return item;
            })
          };
        });
      });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousValue]) => {
          queryClient.setQueryData(queryKey, previousValue);
        });
      }
      alert(err.message || 'Failed to update application stage.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });

  const handleDrop = (stage: ApplicationPipelineStage) => {
    if (!draggedId) return;
    updateStageMutation.mutate({ id: draggedId, stage });
    setDraggedId(null);
  };

  const handleDelete = (appId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    startTransition(async () => {
      await deleteApplicationAction(appId);
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
    });
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Application Pipeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track student application submissions, document collections, visas, and enrollment pipeline stages.
          </p>
        </div>

        {/* View toggles & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-white dark:bg-slate-950">
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="h-8 px-3 rounded-md text-xs gap-1"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Board</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3 rounded-md text-xs gap-1"
            >
              <List className="h-3.5 w-3.5" />
              <span>List View</span>
            </Button>
          </div>

          <div className="relative w-48">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setSearch(''); }}
              placeholder="Search apps..."
              className="pl-9 h-9 text-xs rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Editor Card */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-900">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-500" />
            <span>{form.id ? 'Modify Application Details' : 'Register Student Application'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Select Student">
              <select
                value={form.studentId}
                onChange={(event) => setForm({ ...form, studentId: event.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Student --</option>
                {studentsList.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </Field>

            <Field label="Select University">
              <select
                value={form.universityId}
                onChange={(event) => setForm({ ...form, universityId: event.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose University --</option>
                {(unis ?? []).map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.country})</option>
                ))}
              </select>
            </Field>

            <Field label="Select Program">
              <select
                value={form.programId}
                onChange={(event) => setForm({ ...form, programId: event.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Program --</option>
                {(progs ?? [])
                  .filter((p: any) => !form.universityId || p.university_id === form.universityId)
                  .map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.universities?.name || 'Partner'})
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Application number">
              <Input
                value={form.applicationNumber}
                onChange={(event) => setForm({ ...form, applicationNumber: event.target.value })}
                placeholder="APP-10294"
              />
            </Field>
            
            <Field label="Pipeline Stage">
              <select
                value={form.stage}
                onChange={(event) => setForm({ ...form, stage: event.target.value as ApplicationPipelineStage })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                {APPLICATION_PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>{applicationStageLabel(s)}</option>
                ))}
              </select>
            </Field>

            <Field label="Intake term"><Input value={form.intakeTerm} onChange={(event) => setForm({ ...form, intakeTerm: event.target.value })} placeholder="Fall / Spring" /></Field>
            <Field label="Intake year"><Input type="number" value={form.intakeYear} onChange={(event) => setForm({ ...form, intakeYear: event.target.value })} placeholder="2026" /></Field>
            <Field label="Fee Amount"><Input value={form.feeAmount} onChange={(event) => setForm({ ...form, feeAmount: event.target.value })} placeholder="100.00" /></Field>
            
            <Field label="Notes" className="md:col-span-4"><Input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="E.g. transcripts uploaded, awaiting reference letter" /></Field>
          </div>
          <div className="mt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-900 pt-4">
            <Button type="submit" loading={saving} className="px-6">
              {form.id ? 'Update Application' : 'Create Application'}
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={() => setForm(emptyForm)}>Reset</Button>
          </div>
          </form>
        </CardContent>
      </Card>

      {/* Grid: Kanban Board OR List view */}
      {isLoading ? (
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-400">Loading applications pipeline...</p>
          <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 overflow-x-auto pb-4">
          {APPLICATION_PIPELINE_STAGES.map((stage) => {
            const list = grouped[stage] || [];
            return (
              <div
                key={stage}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(stage)}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 min-w-[250px] space-y-4 h-fit"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {applicationStageLabel(stage)}
                  </span>
                  <span className="h-5 w-5 flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-[10px] font-bold rounded-full text-slate-500">
                    {list.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {list.map((application: any) => (
                    <div
                      key={application.id}
                      draggable
                      onDragStart={() => setDraggedId(application.id)}
                      className="cursor-grab rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 p-4 hover:shadow-md transition-shadow relative group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {application.application_number}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => setForm({
                              id: application.id,
                              studentId: application.student_id,
                              universityId: application.university_id,
                              programId: application.program_id,
                              applicationNumber: application.application_number,
                              stage: (application.stage || application.status) as ApplicationPipelineStage,
                              intakeTerm: application.intake_term || '',
                              intakeYear: application.intake_year?.toString() || '',
                              feeAmount: application.fee_amount?.toString() || '',
                              notes: application.notes || '',
                              assignedCounsellorId: application.assigned_counsellor_id || '',
                              branchId: application.branch_id || '',
                            })}
                            className="p-1 text-slate-400 hover:text-slate-900"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(application.id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-400 space-y-1">
                        <p className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {application.students?.full_name || 'Student'}
                          </span>
                        </p>
                        <p className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3 text-slate-400" />
                          <span>{application.universities?.name || 'University'}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-slate-400" />
                          <span>{application.programs?.name || 'Program'}</span>
                        </p>
                      </div>

                      {(application.intake_term || application.intake_year) && (
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{application.intake_term} {application.intake_year}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (Table layout) */
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr className="text-left">
                  <th className="py-3 px-4">App Number</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">University & Program</th>
                  <th className="py-3 px-4">Intake</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {filteredApps.map((application: any) => (
                  <tr key={application.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {application.application_number}
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {application.students?.full_name || '—'}
                    </td>
                    <td className="py-4 px-4 space-y-0.5">
                      <p className="text-xs text-slate-900 dark:text-slate-100">{application.universities?.name || '—'}</p>
                      <p className="text-[10px] text-slate-400">{application.programs?.name || '—'}</p>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {application.intake_term} {application.intake_year}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {applicationStageLabel((application.stage || application.status) as ApplicationPipelineStage)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setForm({
                          id: application.id,
                          studentId: application.student_id,
                          universityId: application.university_id,
                          programId: application.program_id,
                          applicationNumber: application.application_number,
                          stage: (application.stage || application.status) as ApplicationPipelineStage,
                          intakeTerm: application.intake_term || '',
                          intakeYear: application.intake_year?.toString() || '',
                          feeAmount: application.fee_amount?.toString() || '',
                          notes: application.notes || '',
                          assignedCounsellorId: application.assigned_counsellor_id || '',
                          branchId: application.branch_id || '',
                        })}
                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(application.id)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!isLoading && hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button type="button" variant="outline" loading={isFetchingNextPage} onClick={() => fetchNextPage()} className="gap-2">
            Load more
          </Button>
        </div>
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
