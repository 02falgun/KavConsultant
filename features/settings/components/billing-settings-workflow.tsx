"use client";

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SubscriptionInfo = {
  planKey: 'starter' | 'growth' | 'enterprise';
  status: string;
  seats: number;
  trialEndsAt: string;
  periodEnd: string;
};

export function BillingSettingsWorkflow() {
  const [sub, setSub] = useState<SubscriptionInfo>({
    planKey: 'growth',
    status: 'active',
    seats: 12,
    trialEndsAt: 'N/A',
    periodEnd: '2026-07-12',
  });

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = (planKey: 'starter' | 'growth' | 'enterprise') => {
    setLoadingPlan(planKey);
    setTimeout(() => {
      setLoadingPlan(null);
      setSub({
        ...sub,
        planKey,
        seats: planKey === 'starter' ? 5 : planKey === 'growth' ? 20 : 99,
      });
      alert(`Razorpay Checkout Successful! Subscribed to ${planKey.toUpperCase()} plan.`);
    }, 1200);
  };

  const pricingPlans = [
    {
      key: 'starter' as const,
      name: 'Starter Plan',
      price: '$29',
      seats: 'Up to 5 seats',
      features: [
        'Core CRM modules',
        'Basic students/applications list',
        'Email notifications',
        'Standard dashboard stats',
      ],
      badge: '',
    },
    {
      key: 'growth' as const,
      name: 'Growth Plan',
      price: '$79',
      seats: 'Up to 20 seats',
      features: [
        'Everything in Starter',
        'Kanban application board',
        'Embeddable Lead Forms',
        'SMART Inbox integrations',
        'Automation Engine builder (3 rules)',
      ],
      badge: 'POPULAR',
    },
    {
      key: 'enterprise' as const,
      name: 'Enterprise Plan',
      price: '$199',
      seats: 'Unlimited seats',
      features: [
        'Everything in Growth',
        'AI insights summary widget',
        'Unlimited automation rules',
        'Branch multi-tenant analytics',
        'Dedicated success manager',
      ],
      badge: 'BEST VALUE',
    }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-indigo-500" />
          <span>Billing & Subscriptions</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review your current plan details, allocate user seats, upgrade workspace levels, and track payment invoices.
        </p>
      </div>

      {/* Active Subscription Panel */}
      <Card className="rounded-2xl border-indigo-200 bg-indigo-50/20 dark:border-indigo-950 dark:bg-indigo-950/10 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Active Plan
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 uppercase">
              {sub.planKey} Plan
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 font-sans">
              <span>Status: <strong className="text-emerald-500 uppercase">{sub.status}</strong></span>
              <span>•</span>
              <span>Allocated Seats: <strong>{sub.seats}</strong></span>
              <span>•</span>
              <span>Renews On: <strong>{sub.periodEnd}</strong></span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="rounded-lg h-9 text-xs">
              Manage Seats
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 text-xs">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Pricing Plans</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => {
            const active = sub.planKey === plan.key;
            return (
              <Card
                key={plan.key}
                className={`rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col justify-between overflow-hidden ${
                  active ? 'border-2 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950' : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full">
                    {plan.badge}
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{plan.name}</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-50">{plan.price}</span>
                    <span className="text-xs text-slate-400">/month</span>
                  </div>
                  <span className="text-xs text-indigo-500 block pt-1 font-semibold">{plan.seats}</span>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between p-6 pt-0 space-y-6">
                  <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={active || loadingPlan !== null}
                    className={`w-full rounded-lg h-9 text-xs gap-1.5 ${
                      active
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <span>{active ? 'Current active plan' : loadingPlan === plan.key ? 'Launching Checkout...' : `Upgrade to ${plan.key}`}</span>
                    {!active && <ArrowRight className="h-3.5 w-3.5" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-900">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-indigo-500" />
            <span>Invoice History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr className="text-left">
                  <th className="py-3 px-4">Invoice Number</th>
                  <th className="py-3 px-4">Billing Date</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-4 px-4 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">INV-2026-9024</td>
                  <td className="py-4 px-4 text-xs text-slate-400">2026-06-12</td>
                  <td className="py-4 px-4 text-xs">Growth Plan</td>
                  <td className="py-4 px-4 text-xs font-bold text-slate-900 dark:text-slate-100">$79.00 USD</td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20">
                      PAID
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-4 px-4 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">INV-2026-8104</td>
                  <td className="py-4 px-4 text-xs text-slate-400">2026-05-12</td>
                  <td className="py-4 px-4 text-xs">Growth Plan</td>
                  <td className="py-4 px-4 text-xs font-bold text-slate-900 dark:text-slate-100">$79.00 USD</td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20">
                      PAID
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
