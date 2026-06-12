"use client";

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  MapPin,
  CheckCircle,
  Phone,
  Mail,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BranchRecord = {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  isPrimary: boolean;
};

export function BranchesSettingsWorkflow() {
  const [branches, setBranches] = useState<BranchRecord[]>([
    {
      id: '1',
      code: 'KTM-HQ',
      name: 'Kathmandu Headquarters',
      city: 'Kathmandu',
      country: 'Nepal',
      phone: '+977-1-4444444',
      email: 'ktm@kavconsultant.com',
      isPrimary: true,
    },
    {
      id: '2',
      code: 'PKR-BR',
      name: 'Pokhara Branch Office',
      city: 'Pokhara',
      country: 'Nepal',
      phone: '+977-61-555555',
      email: 'pokhara@kavconsultant.com',
      isPrimary: false,
    }
  ]);

  const [form, setForm] = useState({
    id: '',
    code: '',
    name: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    isPrimary: false,
  });

  const handleSubmit = () => {
    if (!form.name || !form.code) return;

    let updatedBranches = [...branches];
    if (form.isPrimary) {
      updatedBranches = updatedBranches.map(b => ({ ...b, isPrimary: false }));
    }

    if (form.id) {
      setBranches(updatedBranches.map(b => b.id === form.id ? { ...form } : b));
    } else {
      setBranches([...updatedBranches, { ...form, id: Math.random().toString() }]);
    }

    setForm({ id: '', code: '', name: '', city: '', country: '', phone: '', email: '', isPrimary: false });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    setBranches(branches.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Building2 className="h-7 w-7 text-indigo-500" />
          <span>Branch Management</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Add offices, set timezone locations, select primary office hubs, and allocate managers.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Branch CRUD Form */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-500" />
              <span>{form.id ? 'Edit Office Details' : 'Register New Office'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 col-span-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="KTM-HQ" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Branch Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kathmandu Office" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Kathmandu" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Country</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Nepal" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Contact Number</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+977-1-44444" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs uppercase font-extrabold text-slate-400">Office Email Address</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ktm@consultancy.com" />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={form.isPrimary}
                onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="isPrimary" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Set as Primary Office Location
              </Label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
              <Button type="button" onClick={handleSubmit} className="flex-1 h-10">
                {form.id ? 'Save Changes' : 'Register Office'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Office Listing table */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-md font-bold">Office Branches</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-left">
                    <th className="py-3 px-4">Office Branch</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {branches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span>{b.name}</span>
                          {b.isPrimary && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              <span>HQ</span>
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-slate-400 uppercase font-mono mt-0.5">Code: {b.code}</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{b.city}, {b.country}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 space-y-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{b.phone}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{b.email}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setForm(b)} className="h-8 w-8 text-slate-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500">
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
