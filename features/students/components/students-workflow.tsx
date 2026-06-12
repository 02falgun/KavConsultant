"use client";

import type { ReactNode } from 'react';
import { useState, useTransition, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Edit,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudents } from '@/hooks/use-students';
import { useCrmStore } from '@/store/crm';
import { deleteStudentAction, exportStudentsAction, importStudentsAction, saveStudentAction } from '@/server-actions/crm';
import type { StudentRecord } from '@/lib/types/crm';

const emptyForm = {
  id: '',
  fullName: '',
  email: '',
  phone: '',
  source: 'organic',
  preferredCountry: '',
  branchId: '',
  assignedCounsellorId: '',
  leadScore: 0,
  notes: '',
  tagsText: '',
};

export function StudentsWorkflow() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const search = useCrmStore((state) => state.studentSearch);
  const setSearch = useCrmStore((state) => state.setStudentSearch);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data, isLoading } = useStudents();
  const students = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  const handleSubmit = () => {
    if (!form.fullName) {
      alert("Student name is required.");
      return;
    }
    startTransition(async () => {
      const result = await saveStudentAction({
        ...form,
        tags: form.tagsText ? form.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      });
      if (!result.ok) {
        alert(result.error || "Failed to save student record.");
        return;
      }
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: ['students'] });
    });
  };

  const handleDelete = (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student profile?")) return;
    startTransition(async () => {
      await deleteStudentAction(studentId);
      await queryClient.invalidateQueries({ queryKey: ['students'] });
    });
  };

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportStudentsAction();
      if (!result.ok || !result.data) return;
      const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'students.csv';
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    startTransition(async () => {
      const result = await importStudentsAction(text);
      if (result.ok) {
        alert("Imported CSV data successfully.");
        await queryClient.invalidateQueries({ queryKey: ['students'] });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Student Profiles
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage student registrations, capture details, and track statuses.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={handleExport} className="rounded-lg text-xs h-9 gap-1.5">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors h-9 gap-1.5">
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={(event) => handleImport(event.target.files?.[0] ?? null)} />
          </label>
        </div>
      </div>

      {/* Grid: Form Editor & Student Directory Table */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Editor panel */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              <span>{form.id ? 'Edit Student Details' : 'Register New Student'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Field label="Full name">
              <Input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="John Doe" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="johndoe@email.com" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+123456789" />
            </Field>
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="Source">
                <select
                  value={form.source}
                  onChange={(event) => setForm({ ...form, source: event.target.value })}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="organic">Organic</option>
                  <option value="paid_ads">Paid Ads</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="import">Import</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Lead Score">
                <Input type="number" min={0} max={100} value={form.leadScore} onChange={(event) => setForm({ ...form, leadScore: Number(event.target.value) })} />
              </Field>
            </div>

            <Field label="Preferred country">
              <Input value={form.preferredCountry} onChange={(event) => setForm({ ...form, preferredCountry: event.target.value })} placeholder="Canada, UK, USA" />
            </Field>
            <Field label="Tags (comma-separated)">
              <Input value={form.tagsText} onChange={(event) => setForm({ ...form, tagsText: event.target.value })} placeholder="visa, urgent, intake_2026" />
            </Field>
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="w-full min-h-[80px] p-3 text-sm rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional notes about applicant..."
              />
            </Field>
            
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
              <Button type="button" onClick={handleSubmit} disabled={pending} className="flex-1">
                {form.id ? 'Save Changes' : 'Register'}
              </Button>
              {form.id && (
                <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Directory List Table */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <span>Student Directory</span>
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-64 relative">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students..." className="pl-9 h-9 text-xs rounded-lg" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileSpreadsheet className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-md font-bold text-slate-900 dark:text-slate-50">No students registered</h3>
                <p className="text-sm text-slate-400 max-w-xs mt-1">
                  Start by manually registering a student or importing a student CSV database template.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr className="text-left">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {students.map((student: StudentRecord & Record<string, any>) => (
                      <tr key={student.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30">
                        <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {student.full_name}
                        </td>
                        <td className="py-4 px-4 space-y-0.5">
                          <p className="text-slate-950 dark:text-slate-200 text-xs">{student.email ?? '—'}</p>
                          <p className="text-slate-400 text-[10px]">{student.phone ?? '—'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs">
                          {student.preferred_country || '—'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.lead_score > 70
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                              : student.lead_score > 40
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                          }`}>
                            {student.lead_score}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setForm({
                              id: student.id,
                              fullName: student.full_name,
                              email: student.email ?? '',
                              phone: student.phone ?? '',
                              source: student.source,
                              preferredCountry: student.preferred_country ?? '',
                              branchId: '',
                              assignedCounsellorId: '',
                              leadScore: student.lead_score,
                              notes: student.notes ?? '',
                              tagsText: (student.tags ?? []).join(', ')
                            })}
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(student.id)}
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
            )}

            {/* Pagination Panel */}
            {totalCount > 20 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, totalCount)} of {totalCount} students
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1} className="h-8 gap-1">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages} className="h-8 gap-1">
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
