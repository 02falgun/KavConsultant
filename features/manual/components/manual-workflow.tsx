"use client";

import React from 'react';
import {
  BookOpenCheck,
  UserCheck,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  CheckSquare,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type GuideSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  intro: string;
  steps: string[];
  tip?: string;
};

const SECTIONS: GuideSection[] = [
  {
    id: 'team',
    title: 'Team Management',
    icon: UserCheck,
    intro: 'Invite colleagues into your workspace and assign them a role (Admin, Manager, or Counsellor).',
    steps: [
      'Open Settings > Team Management from the sidebar.',
      'Find your workspace Tenant ID (shown in the workspace context / Supabase tenants table) and paste it into the Tenant ID field.',
      'Enter the teammate email and pick a role: ADMIN, MANAGER, or COUNSELLOR.',
      'Click Invite. An invitation row is created and an invite email is sent.',
      'Copy the returned Invitation ID and share it with your teammate.',
      'The teammate opens the invite email, signs in, goes to /accept-invite, pastes the Invitation ID, and accepts.',
    ],
    tip: 'Only Admin and Manager roles can send invites. New members need an active membership before they can reach the dashboard.',
  },
  {
    id: 'branches',
    title: 'Branches',
    icon: Building2,
    intro: 'Set up the physical or regional offices your workspace operates from.',
    steps: [
      'Open Settings > Branches from the sidebar.',
      'Click Add Branch.',
      'Fill in the branch code, name, and contact details (email, phone, address).',
      'Mark one branch as Primary if it is your headquarters.',
      'Save. The branch becomes available when assigning students and staff.',
    ],
    tip: 'Branch codes must be unique within your workspace.',
  },
  {
    id: 'universities',
    title: 'Universities',
    icon: GraduationCap,
    intro: 'Maintain the list of partner institutions students can apply to.',
    steps: [
      'Open Universities from the sidebar.',
      'Click Add University.',
      'Enter the university name, country, and status (active/inactive).',
      'Save. Use the edit and delete actions on each row to keep the list current.',
    ],
    tip: 'Add a university before creating programs, since programs must link to a university.',
  },
  {
    id: 'programs',
    title: 'Programs',
    icon: BookOpen,
    intro: 'Register courses offered by your partner universities, with tuition and intake details.',
    steps: [
      'Add at least one university first (see Universities above).',
      'Open Programs from the sidebar.',
      'Click Add Program.',
      'Select the partner university, then enter program name, tuition, intake, and duration.',
      'Save. Edit or delete programs anytime from the list.',
    ],
    tip: 'If the Add Program form is blocked, it usually means no university exists yet.',
  },
  {
    id: 'students',
    title: 'Student Details',
    icon: Users,
    intro: 'Capture and manage prospective and active students in your CRM.',
    steps: [
      'Open Students from the sidebar.',
      'Register a student manually with the Add Student form, or import many at once using the CSV template.',
      'Fill in contact info, target country, and assigned counsellor.',
      'Save. Open any student to track their applications and tasks.',
    ],
    tip: 'Use the search box to quickly find a student; press Escape to clear it.',
  },
  {
    id: 'tasks',
    title: 'Tasks',
    icon: CheckSquare,
    intro: 'Track follow-ups and to-dos for students and applications.',
    steps: [
      'Open Tasks from the sidebar.',
      'Click Add Task.',
      'Set a title, due date, and assign it to a team member.',
      'Optionally link the task to a student or application.',
      'Update the status (open, in progress, done) as work progresses.',
    ],
    tip: 'Use the Load more button to page through large task lists.',
  },
];

export function ManualWorkflow() {
  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7 text-indigo-500" />
          <span>User Manual</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Step-by-step guides for the core workflows in your workspace.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex flex-wrap gap-2">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              <section.icon className="h-3.5 w-3.5" />
              {section.title}
            </a>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section.id} id={section.id} className="rounded-2xl scroll-mt-6">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <section.icon className="h-5 w-5" />
                </span>
                <span>{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">{section.intro}</p>
              <ol className="space-y-2">
                {section.steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {section.tip && (
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <span className="font-bold">Tip: </span>
                  {section.tip}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
