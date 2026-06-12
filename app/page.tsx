"use client";

import Link from 'next/link';
import { useState } from 'react';
import {
  GraduationCap,
  Inbox,
  Layers,
  Zap,
  Brain,
  Layout,
  ArrowRight,
  CheckCircle2,
  Globe,
  Users,
  CheckSquare,
  Shield,
  ChevronRight,
  TrendingUp,
  Activity,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'pipeline' | 'ai'>('pipeline');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_50%)] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.08),_transparent_50%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Kav<span className="text-indigo-400">Consultant</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/signin" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="h-9 px-4 inline-flex items-center justify-center text-xs font-bold bg-white text-slate-950 rounded-xl hover:bg-slate-100 transition-all duration-200 shadow-md shadow-white/5 active:scale-95"
            >
              Create Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen Education Consultancy CRM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          The Intelligent CRM built for{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
            Study Abroad Consultancies
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Manage prospective student leads, track university application pipelines on Kanban boards, build custom inquiry forms, and get AI counselor coaching—all in one secure, multi-tenant workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-indigo-600/25 gap-2 active:scale-95"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            href="/signin" 
            className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center text-sm font-semibold border border-slate-800 bg-slate-900/60 rounded-xl hover:bg-slate-900 hover:border-slate-700 text-slate-300 hover:text-white transition-colors duration-200"
          >
            Access Dashboard
          </Link>
        </div>
      </section>

      {/* Product Interactive Preview Mockup */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-1.5 backdrop-blur shadow-2xl shadow-indigo-500/5 overflow-hidden">
          {/* Header controls bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 text-slate-500 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/60" />
              <span className="h-3 w-3 rounded-full bg-amber-500/60" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('pipeline')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'pipeline' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'hover:text-slate-300'
                }`}
              >
                Applications Board
              </button>
              <button 
                onClick={() => setActiveTab('inbox')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'inbox' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'hover:text-slate-300'
                }`}
              >
                SMART Inbox
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'ai' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'hover:text-slate-300'
                }`}
              >
                AI Assistant
              </button>
            </div>
          </div>

          {/* Interactive display area */}
          <div className="p-6 bg-slate-950/60 min-h-[360px] flex flex-col justify-between">
            {activeTab === 'pipeline' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
                  <span className="text-sm font-bold text-white">Application Stages</span>
                  <span className="text-xs text-slate-400">Drag & Drop status tracking</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stage New */}
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 space-y-3">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <span>Applied (New)</span>
                      <span className="h-4 px-1.5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">2</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/90 shadow-sm cursor-grab">
                      <div className="text-xs font-bold text-white">Raman Sharma</div>
                      <div className="text-[10px] text-indigo-400 font-medium mt-1">Oxford University - MSc CS</div>
                      <div className="text-[9px] text-slate-500 mt-2 flex justify-between">
                        <span>ID: OX-291</span>
                        <span>High Priority</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Offer */}
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 space-y-3">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <span>Offer Received</span>
                      <span className="h-4 px-1.5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-400">1</span>
                    </div>
                    <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 shadow-sm border-l-2 border-l-emerald-500">
                      <div className="text-xs font-bold text-white">Aditi Patel</div>
                      <div className="text-[10px] text-indigo-300 font-medium mt-1">U of Toronto - BBA</div>
                      <div className="text-[9px] text-slate-500 mt-2 flex justify-between">
                        <span>ID: UT-803</span>
                        <span className="text-emerald-400 font-bold">Unconditional</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Visa */}
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 space-y-3">
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <span>Visa Process</span>
                      <span className="h-4 px-1.5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">0</span>
                    </div>
                    <div className="h-20 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-[11px] text-slate-600">
                      Drag card here to update stage
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inbox' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
                  <span className="text-sm font-bold text-white">SMART Urgent Action Inbox</span>
                  <span className="text-xs text-rose-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>2 tasks need response</span>
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-500/10 text-rose-400">Overdue Task</span>
                      <h4 className="text-xs font-bold text-white">Call Aarav to gather passport documents for Visa</h4>
                      <p className="text-[10px] text-slate-400">Student: Aarav Negi • Due 2 hours ago</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold">Log Call</button>
                      <button className="h-8 px-3 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-medium">WhatsApp</button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400">High Score Lead</span>
                      <h4 className="text-xs font-bold text-white">New Website Inquiry - Study in Germany</h4>
                      <p className="text-[10px] text-slate-400">Student: Rahul Kumar • Lead Score: 87/100</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold">Assign Counsellor</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
                  <span className="text-sm font-bold text-white">Counselor Performance & Next Actions</span>
                  <span className="text-xs text-indigo-400">AI Engine Powered</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2">
                    <div className="text-xs font-extrabold text-indigo-300 uppercase flex items-center gap-1">
                      <Brain className="h-4 w-4" />
                      <span>Next Best Actions</span>
                    </div>
                    <ul className="text-[10px] text-slate-300 space-y-2 list-disc list-inside">
                      <li>Draft email for Oxford CS follow-up (high probability of acceptance).</li>
                      <li>Schedule interview prep for Aditi (U of Toronto BBA).</li>
                      <li>Reassign 3 stale leads with scores &lt; 30 to auto-nurture campaign.</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                    <div className="text-xs font-bold text-white">Counselor Lead SLA Status</div>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Response SLA Compliance</span>
                        <span className="text-emerald-400 font-bold">96.8%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full w-[96.8%] bg-emerald-500" />
                      </div>
                      <div className="flex justify-between text-[10px] pt-1">
                        <span className="text-slate-400">Average Response Speed</span>
                        <span className="text-white font-bold">14 mins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom mini-bar */}
            <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
              <span>Tenant Status: Active (Starter Plan)</span>
              <span>Workspace ID: wanmdazaqzbfyeohfaon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-900">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Designed for High-Performance Teams
          </h2>
          <p className="text-sm text-slate-400">
            Streamline counselors, study abroad programs, and visa tasks in a unified CRM.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={Inbox}
            title="SMART Inbox"
            description="Urgency-based prioritization combines student tasks and lead alerts. Direct WhatsApp & Call logging actions with single clicks."
          />
          <FeatureCard 
            icon={Layers}
            title="Application Pipelines"
            description="Drag and drop prospective student application pipelines. Complete visibility of draft, submitted, acceptance, and visa stages."
          />
          <FeatureCard 
            icon={Brain}
            title="AI Counselor Coaching"
            description="Receive automatic performance feedback. Analyzes student scores, response speeds, and suggests next best actions."
          />
          <FeatureCard 
            icon={Zap}
            title="No-Code Automations"
            description="Automatically assign leads to branch counsellors based on preferred destination country or source, and auto-generate tasks."
          />
          <FeatureCard 
            icon={Layout}
            title="Forms & Page Builder"
            description="Design custom inquiry forms, host inquiry landing pages, or copy embed codes to map leads directly to your pipeline."
          />
          <FeatureCard 
            icon={Shield}
            title="Multi-Tenant Isolation"
            description="Role-based permissions (Admin, Manager, Counsellor) with strict branch-scoped row level security to protect student data."
          />
        </div>
      </section>

      {/* Interactive Pricing Summary */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-900 text-center">
        <div className="max-w-xl mx-auto space-y-2 mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Flexible Plans for Growing Agencies
          </h2>
          <p className="text-sm text-slate-400">
            Select a plan to start. Fully functional mock payment billing flows included.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <PricingCard 
            name="Starter"
            price="₹4,999"
            period="counsellor/month"
            description="Ideal for individual counselors and small study abroad bureaus."
            features={['Up to 3 Counsellors', '500 Active Student Profiles', 'Standard Application Pipeline', 'Basic Email Support']}
            cta="Get Started"
          />

          {/* Growth Plan */}
          <PricingCard 
            name="Growth"
            price="₹9,999"
            period="counsellor/month"
            description="Perfect for mid-sized consultancies with multiple university partners."
            features={['Up to 15 Counsellors', 'Uncapped Student Profiles', 'Multi-Branch Management', 'AI Insight Coaching', 'API/Embedded Lead Forms', 'Priority Support']}
            popular={true}
            cta="Try Growth Free"
          />

          {/* Enterprise Plan */}
          <PricingCard 
            name="Enterprise"
            price="Custom"
            period="agency/month"
            description="Designed for global consultancies with large team sizes and partners."
            features={['Unlimited Counsellors', 'Dedicated Database Schema', 'White-labeled Domain mapping', 'Custom Automation rules', 'Dedicated Success Manager', 'SLA compliance audits']}
            cta="Contact Sales"
          />
        </div>
      </section>

      {/* Trust & CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 via-violet-900/10 to-slate-950 p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to automate your consultancy?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Join consultancies worldwide that use KavConsultant to digitize admissions, boost counselor speeds, and coordinate visa follow-ups.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto h-12 px-8 inline-flex items-center justify-center text-sm font-bold bg-white text-slate-950 rounded-xl hover:bg-slate-100 transition-all duration-200 shadow-lg"
              >
                Create Free Workspace
              </Link>
              <Link 
                href="/signin" 
                className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center text-sm font-semibold border border-slate-800 bg-slate-900/40 rounded-xl hover:bg-slate-900 hover:border-slate-700 text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 py-12 text-sm text-center">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            <span className="font-extrabold text-white">KavConsultant</span>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 KavConsultant. All rights reserved. Built for education consultancies, agency branches, and counselor teams.
          </p>
        </div>
      </footer>
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
};

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800/80 transition-all duration-300">
      <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

type PricingCardProps = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
};

function PricingCard({ name, price, period, description, features, popular = false, cta }: PricingCardProps) {
  return (
    <div className={`p-8 rounded-3xl border text-left flex flex-col justify-between ${
      popular 
        ? 'border-indigo-500 bg-indigo-500/5 relative shadow-xl shadow-indigo-500/5' 
        : 'border-slate-900 bg-slate-900/10'
    }`}>
      {popular && (
        <span className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-indigo-500 text-white text-[9px] font-extrabold uppercase tracking-widest">
          Most Popular
        </span>
      )}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
        <div className="flex items-baseline gap-1 pt-2">
          <span className="text-3xl font-extrabold text-white">{price}</span>
          <span className="text-xs text-slate-500">/{period}</span>
        </div>
        <ul className="space-y-2.5 pt-4 border-t border-slate-900">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-8">
        <Link 
          href="/signup" 
          className={`w-full h-10 inline-flex items-center justify-center text-xs font-bold rounded-xl transition-all active:scale-95 ${
            popular 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25' 
              : 'border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-200 hover:text-white'
          }`}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
