"use client";

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Clock,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePrograms } from '@/hooks/use-programs';
import { useUniversities } from '@/hooks/use-universities';
import { saveProgramAction, deleteProgramAction } from '@/server-actions/crm';

const DEGREE_LEVELS = ['Undergraduate', 'Postgraduate', 'Doctorate', 'Diploma'];

const emptyForm = {
  id: '',
  name: '',
  universityId: '',
  degreeLevel: 'Postgraduate',
  fieldOfStudy: '',
  tuitionFee: '',
  durationMonths: '',
};

export function ProgramsWorkflow() {
  const queryClient = useQueryClient();
  const { data: programsData, isLoading } = usePrograms();
  const { data: universitiesData } = useUniversities();
  const programs = (programsData ?? []) as any[];
  const universities = (universitiesData ?? []) as any[];

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.universityId) {
      alert('Program name and a linked university are required.');
      return;
    }
    setSaving(true);
    try {
      const result = await saveProgramAction({
        id: form.id || undefined,
        universityId: form.universityId,
        name: form.name,
        degreeLevel: form.degreeLevel,
        fieldOfStudy: form.fieldOfStudy,
        durationMonths: form.durationMonths === '' ? null : Number(form.durationMonths),
        tuitionFee: form.tuitionFee === '' ? null : Number(form.tuitionFee),
      });
      if (!result.ok) {
        alert(result.error || 'Failed to save program.');
        return;
      }
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ['programs'] });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      id: p.id,
      name: p.name ?? '',
      universityId: p.university_id ?? '',
      degreeLevel: p.degree_level ?? 'Postgraduate',
      fieldOfStudy: p.field_of_study ?? '',
      tuitionFee: p.tuition_fee_min != null ? String(p.tuition_fee_min) : '',
      durationMonths: p.duration_months != null ? String(p.duration_months) : '',
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study program?')) return;
    setDeletingId(id);
    try {
      const result = await deleteProgramAction(id);
      if (!result.ok) {
        alert(result.error || 'Failed to delete program.');
        return;
      }
      if (form.id === id) resetForm();
      await queryClient.invalidateQueries({ queryKey: ['programs'] });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = programs.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (p.name ?? '').toLowerCase().includes(term) ||
      (p.universities?.name ?? '').toLowerCase().includes(term) ||
      (p.field_of_study ?? '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-500" />
            <span>Program Catalog</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Search, list, and register courses, tuition details, intakes, and durations linked to partner universities.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* CRUD Form */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-500" />
              <span>{form.id ? 'Edit Course Details' : 'Register New Course'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {universities.length === 0 ? (
              <div className="py-8 text-center">
                <GraduationCap className="h-9 w-9 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add a partner university first before registering programs.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-extrabold text-slate-400">Course / Program Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={saving} placeholder="E.g. MSc Data Science" />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs uppercase font-extrabold text-slate-400">Linked Partner University</Label>
                  <select
                    value={form.universityId}
                    onChange={(e) => setForm({ ...form, universityId: e.target.value })}
                    disabled={saving}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">-- Choose University --</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-extrabold text-slate-400">Degree Level</Label>
                    <select
                      value={form.degreeLevel}
                      onChange={(e) => setForm({ ...form, degreeLevel: e.target.value })}
                      disabled={saving}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {DEGREE_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-extrabold text-slate-400">Department</Label>
                    <Input value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} disabled={saving} placeholder="Science" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-extrabold text-slate-400">Tuition Fee ($/yr)</Label>
                    <Input type="number" min={0} value={form.tuitionFee} onChange={(e) => setForm({ ...form, tuitionFee: e.target.value })} disabled={saving} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-extrabold text-slate-400">Duration (Months)</Label>
                    <Input type="number" min={1} value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} disabled={saving} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
                  <Button type="submit" loading={saving} className="flex-1 h-10">
                    {form.id ? 'Save Program' : 'Register Program'}
                  </Button>
                  {form.id && (
                    <Button type="button" variant="ghost" disabled={saving} onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Catalog List */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-md font-bold">Programs List</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setSearch(''); }} placeholder="Search program or university..." className="pl-9 h-9 text-xs" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-md font-bold text-slate-900 dark:text-slate-50">
                  {programs.length === 0 ? 'No programs registered yet' : 'No matches found'}
                </h3>
                <p className="text-sm text-slate-400 max-w-xs mt-1">
                  {programs.length === 0
                    ? 'Register your first study program using the form on the left.'
                    : 'Try a different search term.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr className="text-left">
                      <th className="py-3 px-4">Program Details</th>
                      <th className="py-3 px-4">University Name</th>
                      <th className="py-3 px-4">Duration & Tuition</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {p.name}
                          <span className="block text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                            {[p.degree_level, p.field_of_study].filter(Boolean).join(' • ') || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{p.universities?.name || '—'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 space-y-0.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{p.duration_months ? `${p.duration_months} months` : '—'}</span>
                          </span>
                          {p.tuition_fee_min != null && (
                            <span className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-bold">
                              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                              <span>{Number(p.tuition_fee_min).toLocaleString()}/yr</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-8 w-8 text-slate-500">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" loading={deletingId === p.id} disabled={deletingId === p.id} onClick={() => handleDelete(p.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500">
                            {deletingId === p.id ? null : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
