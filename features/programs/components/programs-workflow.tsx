"use client";

import React, { useState } from 'react';
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

type ProgramRecord = {
  id: string;
  name: string;
  degreeLevel: string;
  department: string;
  universityName: string;
  tuitionFee: number;
  durationMonths: number;
};

export function ProgramsWorkflow() {
  const [programs, setPrograms] = useState<ProgramRecord[]>([
    {
      id: '1',
      name: 'MSc Computer Science',
      degreeLevel: 'Postgraduate',
      department: 'Engineering',
      universityName: 'Oxford University',
      tuitionFee: 32000,
      durationMonths: 12,
    },
    {
      id: '2',
      name: 'MBA Business Administration',
      degreeLevel: 'Postgraduate',
      department: 'Business School',
      universityName: 'University of Toronto',
      tuitionFee: 45000,
      durationMonths: 24,
    },
    {
      id: '3',
      name: 'BSc Data Science',
      degreeLevel: 'Undergraduate',
      department: 'Computer Science',
      universityName: 'MIT',
      tuitionFee: 55000,
      durationMonths: 48,
    }
  ]);

  const [form, setForm] = useState({
    id: '',
    name: '',
    degreeLevel: 'Postgraduate',
    department: '',
    universityName: 'Oxford University',
    tuitionFee: 0,
    durationMonths: 12,
  });

  const [search, setSearch] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.universityName) return;

    if (form.id) {
      setPrograms(programs.map(p => p.id === form.id ? { ...form } : p));
    } else {
      setPrograms([...programs, { ...form, id: Math.random().toString() }]);
    }
    setForm({ id: '', name: '', degreeLevel: 'Postgraduate', department: '', universityName: 'Oxford University', tuitionFee: 0, durationMonths: 12 });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this study program?")) return;
    setPrograms(programs.filter(p => p.id !== id));
  };

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.universityName.toLowerCase().includes(search.toLowerCase())
  );

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
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Course / Program Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="E.g. MSc Data Science" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Linked Partner University</Label>
              <select
                value={form.universityName}
                onChange={(e) => setForm({ ...form, universityName: e.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Oxford University">Oxford University</option>
                <option value="University of Toronto">University of Toronto</option>
                <option value="MIT">MIT</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Degree Level</Label>
                <select
                  value={form.degreeLevel}
                  onChange={(e) => setForm({ ...form, degreeLevel: e.target.value })}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Diploma">Diploma / Pathway</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Science" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Tuition Fee ($/yr)</Label>
                <Input type="number" value={form.tuitionFee} onChange={(e) => setForm({ ...form, tuitionFee: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Duration (Months)</Label>
                <Input type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })} />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
              <Button type="submit" className="w-full h-10">
                {form.id ? 'Save Program' : 'Register Program'}
              </Button>
            </div>
            </form>
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
                        <span className="block text-[10px] text-slate-400 uppercase font-mono mt-0.5">{p.degreeLevel} • {p.department}</span>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>{p.universityName}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 space-y-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{p.durationMonths} months</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-bold">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{p.tuitionFee.toLocaleString()}/yr</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setForm(p)} className="h-8 w-8 text-slate-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
