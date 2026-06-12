"use client";

import React, { useState } from 'react';
import {
  FormInput,
  Plus,
  Eye,
  Code,
  Copy,
  CheckCircle,
  Settings,
  Trash2,
  ListPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CustomField = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select';
  placeholder: string;
  required: boolean;
};

export function FormsWorkflow() {
  const [fields, setFields] = useState<CustomField[]>([
    { id: '1', label: 'Full Name', type: 'text', placeholder: 'Enter student full name', required: true },
    { id: '2', label: 'Email Address', type: 'email', placeholder: 'student@example.com', required: true },
    { id: '3', label: 'Phone Number', type: 'phone', placeholder: '+1 234 567 890', required: true },
    { id: '4', label: 'Preferred Country', type: 'select', placeholder: 'Select destination', required: false },
  ]);

  const [formName, setFormName] = useState('Study Abroad Inquiry Form');
  const [targetStage, setTargetStage] = useState('new');
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe 
  src="http://localhost:3000/embed/forms/${formName.toLowerCase().replace(/\s+/g, '-')}" 
  width="100%" 
  height="600px" 
  frameborder="0" 
  style="border:0; border-radius:12px; background:transparent;"
></iframe>`;

  const addField = () => {
    setFields([...fields, {
      id: Math.random().toString(),
      label: 'New Custom Field',
      type: 'text',
      placeholder: 'Enter detail...',
      required: false,
    }]);
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <FormInput className="h-8 w-8 text-indigo-500" />
          <span>Lead Form Builder</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Create custom inquiry forms, grab clean iframe embed codes, and map incoming submissions directly to pipeline stages.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Editor controls */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-900">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" />
                <span>Form Specifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Form Title</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Pipeline Target Stage</Label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="new">NEW (Default Lead Stage)</option>
                  <option value="qualified">QUALIFIED</option>
                  <option value="document_collection">DOCUMENT COLLECTION</option>
                </select>
                <p className="text-[10px] text-slate-400">Forms automatically create new student and application cards in this stage.</p>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields builder */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-900 gap-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ListPlus className="h-4 w-4 text-indigo-500" />
                <span>Form Field Layout</span>
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addField} className="h-8 text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Field</span>
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center gap-3">
                  <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <Label className="text-[9px] uppercase font-bold text-slate-400">Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...fields];
                          updated[idx].label = e.target.value;
                          setFields(updated);
                        }}
                        className="h-8 text-xs font-semibold bg-white dark:bg-slate-950 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[9px] uppercase font-bold text-slate-400">Placeholder</Label>
                      <Input
                        value={field.placeholder}
                        onChange={(e) => {
                          const updated = [...fields];
                          updated[idx].placeholder = e.target.value;
                          setFields(updated);
                        }}
                        className="h-8 text-xs bg-white dark:bg-slate-950 mt-1"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteField(field.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500 mt-4 flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview & Code generation */}
        <div className="space-y-6">
          {/* Live Preview mockup */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-950">
            <CardHeader className="border-b border-slate-100 dark:border-slate-900">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-500" />
                <span>Live Form Widget Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 max-w-sm mx-auto shadow-sm">
                <h3 className="text-md font-bold text-slate-900 dark:text-slate-50 text-center">{formName}</h3>
                
                {fields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {field.type === 'select' ? (
                      <select className="h-9 w-full rounded border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                        <option value="">{field.placeholder}</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Canada">Canada</option>
                      </select>
                    ) : (
                      <Input disabled placeholder={field.placeholder} className="h-9 text-xs rounded bg-white dark:bg-slate-950" />
                    )}
                  </div>
                ))}
                
                <Button size="sm" className="w-full text-xs rounded h-9 font-bold mt-2">Submit Inquiry</Button>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code output */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-900">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Code className="h-4 w-4 text-indigo-500" />
                <span>Embed Snippet Code</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-8 text-xs gap-1"
              >
                {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy HTML'}</span>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <pre className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs overflow-x-auto text-slate-600 dark:text-slate-400 font-mono">
                {embedCode}
              </pre>
              <p className="text-[10px] text-slate-400 mt-2 font-sans">
                Paste this HTML code into your website's body to start capturing leads instantly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
