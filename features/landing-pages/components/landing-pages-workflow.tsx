"use client";

import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Layout,
  Eye,
  Settings,
  ArrowRight,
  Sparkles,
  Save,
  CheckCircle,
  Copy,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SectionBlock = {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'faq';
  title: string;
  content: string;
};

export function LandingPagesWorkflow() {
  const [sections, setSections] = useState<SectionBlock[]>([
    {
      id: '1',
      type: 'hero',
      title: 'Study Abroad of Your Dreams',
      content: 'Complete overseas counselling, university applications, and visa coordination in one dashboard.',
    },
    {
      id: '2',
      type: 'features',
      title: 'Our Premium Consultancy Services',
      content: 'Personal guidance, university matchmaker database, fast document checkup.',
    },
    {
      id: '3',
      type: 'cta',
      title: 'Ready to begin?',
      content: 'Book a free counselling session with our certified advisors today.',
    }
  ]);

  const [seo, setSeo] = useState({
    title: 'Study Abroad Consultants | Global Education Agency',
    description: 'Register today to get matching university programs, direct application submissions, and visa assistance.',
  });

  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft');

  const addSection = (type: SectionBlock['type']) => {
    const titles = {
      hero: 'Headline Heading Block',
      features: 'Features List Block',
      testimonials: 'Student Success Stories',
      cta: 'Call to Action Block',
      faq: 'Frequently Asked Questions',
    };
    
    setSections([...sections, {
      id: Math.random().toString(),
      type,
      title: titles[type],
      content: 'Click edit to write block contents...',
    }]);
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handlePublish = () => {
    setPublishStatus(publishStatus === 'draft' ? 'published' : 'draft');
    alert(`Page is now ${publishStatus === 'draft' ? 'LIVE at http://localhost:3000/landing/study-abroad' : 'saved as draft'}.`);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Globe className="h-8 w-8 text-indigo-500" />
            <span>Landing Page Builder</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Build responsive, high-converting lead landing pages with custom SEO tags and capture widgets.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePublish} className="h-9 text-xs rounded-lg">
            {publishStatus === 'published' ? 'Unpublish Page' : 'Publish Page'}
          </Button>
          <Button className="h-9 text-xs rounded-lg gap-1.5 pt-1">
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Editor Controls */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layout className="h-4 w-4 text-indigo-500" />
                <span>Page Builder Sections</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-900">
                <Button size="sm" variant="outline" onClick={() => addSection('hero')} className="h-8 text-[10px] uppercase font-extrabold">Add Hero</Button>
                <Button size="sm" variant="outline" onClick={() => addSection('features')} className="h-8 text-[10px] uppercase font-extrabold">Add Features</Button>
                <Button size="sm" variant="outline" onClick={() => addSection('testimonials')} className="h-8 text-[10px] uppercase font-extrabold">Add Reviews</Button>
                <Button size="sm" variant="outline" onClick={() => addSection('cta')} className="h-8 text-[10px] uppercase font-extrabold">Add CTA</Button>
                <Button size="sm" variant="outline" onClick={() => addSection('faq')} className="h-8 text-[10px] uppercase font-extrabold">Add FAQ</Button>
              </div>

              <div className="space-y-3">
                {sections.map((section, idx) => (
                  <div key={section.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Block #{idx+1}: {section.type}</span>
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[idx].title = e.target.value;
                          setSections(updated);
                        }}
                        className="h-8 text-xs font-semibold bg-white dark:bg-slate-950 mt-1"
                      />
                      <Input
                        value={section.content}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[idx].content = e.target.value;
                          setSections(updated);
                        }}
                        className="h-8 text-xs bg-white dark:bg-slate-950 mt-1"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteSection(section.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" />
                <span>SEO & Publishing Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Meta Title</Label>
                <Input value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold text-slate-400">Meta Description</Label>
                <textarea
                  value={seo.description}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                  className="w-full min-h-[60px] p-3 text-xs rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Mock Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500 font-semibold px-2">
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> Live Mockup Preview</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">http://localhost:3000/landing/study-abroad</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-md min-h-[500px] flex flex-col">
            {/* Mock Landing Page Browser Wrapper */}
            <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <div className="bg-white dark:bg-slate-950 px-3 py-0.5 rounded text-[10px] font-semibold text-slate-400 ml-4 flex-1 truncate max-w-sm border border-slate-200 dark:border-slate-800">
                http://kavconsultant.com/pages/demo
              </div>
            </div>

            {/* Simulated Live HTML Render */}
            <div className="flex-1 overflow-y-auto max-h-[500px] p-6 space-y-8 bg-slate-50/50 dark:bg-slate-950/20">
              {sections.map((section) => {
                if (section.type === 'hero') {
                  return (
                    <div key={section.id} className="text-center py-8 px-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-3">
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{section.title}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">{section.content}</p>
                      <Button size="sm" className="rounded-lg text-xs gap-1.5 mt-2">
                        <span>Get Started Today</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                }

                if (section.type === 'features') {
                  return (
                    <div key={section.id} className="space-y-3 py-2">
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 text-center">{section.title}</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-lg flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>Interactive matchmaking directory</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-lg flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>Direct university integrations</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (section.type === 'cta') {
                  return (
                    <div key={section.id} className="p-6 bg-indigo-600 text-white rounded-xl text-center space-y-3 shadow-md">
                      <h3 className="text-md font-bold">{section.title}</h3>
                      <p className="text-xs text-indigo-100 max-w-sm mx-auto">{section.content}</p>
                      
                      {/* Simulated form input */}
                      <div className="flex max-w-xs mx-auto gap-2 pt-2">
                        <input
                          type="email"
                          disabled
                          placeholder="Your email address..."
                          className="flex-1 rounded bg-white/10 border border-white/20 text-xs px-2.5 py-1.5 text-white placeholder-indigo-200 outline-none"
                        />
                        <Button size="sm" variant="outline" className="bg-white text-indigo-600 border-none hover:bg-indigo-50 rounded">
                          Apply
                        </Button>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
