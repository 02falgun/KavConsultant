"use client";

import React, { useState, useTransition } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Globe,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UniversityRecord = {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string;
  email: string;
  type: string;
};

export function UniversitiesWorkflow() {
  const [unis, setUnis] = useState<UniversityRecord[]>([
    {
      id: '1',
      name: 'Oxford University',
      country: 'United Kingdom',
      city: 'Oxford',
      website: 'https://ox.ac.uk',
      email: 'admissions@ox.ac.uk',
      type: 'university',
    },
    {
      id: '2',
      name: 'University of Toronto',
      country: 'Canada',
      city: 'Toronto',
      website: 'https://utoronto.ca',
      email: 'international@utoronto.ca',
      type: 'university',
    },
    {
      id: '3',
      name: 'MIT',
      country: 'United States',
      city: 'Cambridge',
      website: 'https://mit.edu',
      email: 'admissions@mit.edu',
      type: 'institute',
    }
  ]);

  const [form, setForm] = useState({
    id: '',
    name: '',
    country: '',
    city: '',
    website: '',
    email: '',
    type: 'university',
  });

  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!form.name || !form.country) return;
    
    if (form.id) {
      setUnis(unis.map(u => u.id === form.id ? { ...form } : u));
    } else {
      setUnis([...unis, { ...form, id: Math.random().toString() }]);
    }
    setForm({ id: '', name: '', country: '', city: '', website: '', email: '', type: 'university' });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete university and linked programs?")) return;
    setUnis(unis.filter(u => u.id !== id));
  };

  const filtered = unis.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-500" />
            <span>University Directory</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Build and query your global network of partner universities, institutes, and language centers.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* CRUD Form */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-500" />
              <span>{form.id ? 'Edit Partner Details' : 'Register Partner University'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">University Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="E.g. Harvard University" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Country</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="USA" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Boston" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="institute">Institute</option>
                <option value="language_school">Language School</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Website URL</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.edu" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Admissions Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admissions@example.edu" />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
              <Button type="button" onClick={handleSubmit} className="flex-1">
                {form.id ? 'Save Changes' : 'Register Partner'}
              </Button>
              {form.id && (
                <Button type="button" variant="ghost" onClick={() => setForm({ id: '', name: '', country: '', city: '', website: '', email: '', type: 'university' })}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Directory Listing */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-md font-bold">Partner Institutions</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or country..." className="pl-9 h-9 text-xs" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-left">
                    <th className="py-3 px-4">University Name</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {u.name}
                        <span className="block text-[10px] text-slate-400 uppercase font-mono mt-0.5">{u.type}</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{u.city}, {u.country}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 space-y-0.5 text-xs">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Globe className="h-3.5 w-3.5" />
                          <a href={u.website} target="_blank" rel="noreferrer" className="hover:underline">{u.website}</a>
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{u.email}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setForm(u)} className="h-8 w-8 text-slate-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500">
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
