"use client";

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  Search,
  Plus,
  Trash2,
  Edit,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUniversities } from '@/hooks/use-universities';
import { saveUniversityAction, deleteUniversityAction } from '@/server-actions/crm';

const UNIVERSITY_TYPES = [
  { value: 'university', label: 'University' },
  { value: 'college', label: 'College' },
  { value: 'institute', label: 'Institute' },
  { value: 'language_school', label: 'Language School' },
  { value: 'pathway_provider', label: 'Pathway Provider' },
  { value: 'vocational_school', label: 'Vocational School' },
] as const;

const typeLabel = (value: string) =>
  UNIVERSITY_TYPES.find((t) => t.value === value)?.label ?? value;

const emptyForm = {
  id: '',
  name: '',
  country: '',
  city: '',
  website: '',
  email: '',
  phone: '',
  type: 'university',
  ranking: '',
};

const normalizeUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

export function UniversitiesWorkflow() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useUniversities();
  const universities = (data ?? []) as any[];

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.country) {
      alert('University name and country are required.');
      return;
    }
    setSaving(true);
    try {
      const result = await saveUniversityAction({
        id: form.id || undefined,
        name: form.name,
        country: form.country,
        city: form.city,
        website: form.website,
        email: form.email,
        phone: form.phone,
        type: form.type,
        ranking: form.ranking === '' ? null : Number(form.ranking),
      });
      if (!result.ok) {
        alert(result.error || 'Failed to save university.');
        return;
      }
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ['universities'] });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (u: any) => {
    setForm({
      id: u.id,
      name: u.name ?? '',
      country: u.country ?? '',
      city: u.city ?? '',
      website: u.website ?? '',
      email: u.email ?? '',
      phone: u.phone ?? '',
      type: u.type ?? 'university',
      ranking: u.ranking != null ? String(u.ranking) : '',
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner institution? Linked programs and applications may be affected.')) return;
    setDeletingId(id);
    try {
      const result = await deleteUniversityAction(id);
      if (!result.ok) {
        alert(result.error || 'Failed to delete university.');
        return;
      }
      if (form.id === id) resetForm();
      await queryClient.invalidateQueries({ queryKey: ['universities'] });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = universities.filter((u) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (u.name ?? '').toLowerCase().includes(term) ||
      (u.country ?? '').toLowerCase().includes(term) ||
      (u.city ?? '').toLowerCase().includes(term)
    );
  });

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
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">University Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={saving} placeholder="E.g. Harvard University" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-extrabold text-slate-400">Country</Label>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} disabled={saving} placeholder="USA" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-extrabold text-slate-400">City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={saving} placeholder="Boston" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-extrabold text-slate-400">Type</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    disabled={saving}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {UNIVERSITY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-extrabold text-slate-400">Ranking (optional)</Label>
                  <Input type="number" min={1} value={form.ranking} onChange={(e) => setForm({ ...form, ranking: e.target.value })} disabled={saving} placeholder="e.g. 12" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Website URL</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} disabled={saving} placeholder="https://example.edu" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-extrabold text-slate-400">Admissions Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={saving} placeholder="admissions@example.edu" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-extrabold text-slate-400">Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={saving} placeholder="+1 555 0100" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
                <Button type="submit" loading={saving} className="flex-1">
                  {form.id ? 'Save Changes' : 'Register Partner'}
                </Button>
                {form.id && (
                  <Button type="button" variant="ghost" disabled={saving} onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Directory Listing */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-md font-bold">Partner Institutions</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setSearch(''); }} placeholder="Search name, city or country..." className="pl-9 h-9 text-xs" />
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
                <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-md font-bold text-slate-900 dark:text-slate-50">
                  {universities.length === 0 ? 'No partner institutions yet' : 'No matches found'}
                </h3>
                <p className="text-sm text-slate-400 max-w-xs mt-1">
                  {universities.length === 0
                    ? 'Register your first partner university using the form on the left.'
                    : 'Try a different search term.'}
                </p>
              </div>
            ) : (
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
                          <span className="block text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                            {typeLabel(u.type)}{u.ranking ? ` • Rank #${u.ranking}` : ''}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{[u.city, u.country].filter(Boolean).join(', ') || '—'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 space-y-0.5 text-xs">
                          {u.website && (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <Globe className="h-3.5 w-3.5" />
                              <a href={normalizeUrl(u.website)} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-[180px]">{u.website}</a>
                            </span>
                          )}
                          {u.email && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[180px]">{u.email}</span>
                            </span>
                          )}
                          {u.phone && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{u.phone}</span>
                            </span>
                          )}
                          {!u.website && !u.email && !u.phone && <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(u)} className="h-8 w-8 text-slate-500">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" loading={deletingId === u.id} disabled={deletingId === u.id} onClick={() => handleDelete(u.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500">
                            {deletingId === u.id ? null : <Trash2 className="h-4 w-4" />}
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
