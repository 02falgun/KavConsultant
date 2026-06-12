# KavConsultant — Multi-Tenant SaaS CRM for Education Consultancies

[![Live Website](https://img.shields.io/badge/Live-Deployment-indigo?style=for-the-badge)](https://kav-consultant.vercel.app/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**KavConsultant** is a production-grade, multi-tenant SaaS CRM built from the ground up for education consultancies, study abroad agencies, and university counseling centers. The platform streamlines student lead onboarding, handles university application Kanban pipelines, automates workflow assignments, runs security audits, and provides counselors with AI-driven performance coaching.

🔗 **Live Link:** [https://kav-consultant.vercel.app/](https://kav-consultant.vercel.app/)

---

## 🚀 Key Features

*   **⚡ SMART Inbox:** Combines overdue tasks and hot student leads in a single feed sorted by priority score. Supports single-click WhatsApp messaging and phone call logging.
*   **📋 Application Kanban Pipeline:** Drag-and-drop workflow tracking student applications through stages: Draft, Qualified, Document Collection, Applied, Offer Received, Visa, and Enrolled.
*   **🧠 AI Insights Dashboard:** An integrated AI engine that reports counselor performance metrics (SLA response time, compliance) and outputs counselor instructions and next best actions.
*   **⚙️ No-Code Automation Engine:** Auto-assigns incoming student leads to specific counselors or branches based on the student's nationality, source, or country preferences.
*   **🌐 Forms & Landing Page Builder:** Host custom inquiry pages or export dynamic iframe code snippets to embed on partner websites. Incoming submissions automatically inject into the CRM pipeline.
*   **🔒 Enterprise Security & Audit Logs:** Tenant-scoped PostgreSQL Row Level Security (RLS) policies with detailed user activity audit logging (insert, update, delete, imports, export).
*   **💳 Mock Billing & Subscription Tiers:** Starter, Growth, and Enterprise subscription options with simulated Razorpay transaction checkouts.

---

## 🛠️ Technology Stack

*   **Frontend Framework:** Next.js 14 (App Router) with React 18
*   **Language:** TypeScript (Strict Mode)
*   **Styling & Components:** Tailwind CSS, shadcn/ui, Lucide Icons
*   **State Management:** Zustand (Client-side search/filters), TanStack React Query v5 (Server state caching)
*   **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Auth Services, Realtime Notifications)
*   **Forms & Validation:** React Hook Form, Zod Schemas
*   **Charts:** Recharts

---

## 📁 Repository Structure

```text
├── app/                  # Next.js 14 App Router routes & API endpoints
│   ├── (auth)/           # Authentication views (login, signup, reset password)
│   ├── (dashboard)/      # Protected workspace views (leads, tasks, settings, AI)
│   └── api/              # API Route Handlers (Dashboard stats, Inbox, CRM endpoints)
├── components/           # Reusable UI primitives and Layout shells
│   ├── layout/           # Sidebar navigation and tenant switches
│   └── ui/               # shadcn/ui custom components (buttons, cards, inputs)
├── features/             # Feature-based domain logic modules
│   ├── dashboard/        # Dashboard KPIs & charts
│   ├── students/         # Student record forms & filters
│   ├── applications/     # Kanban pipeline logic
│   └── notifications/    # Realtime notification feed hooks
├── hooks/                # Custom React hooks (React Query fetching hooks)
├── lib/                  # Shared utilities, auth context helpers, validations
├── server-actions/       # Next.js Server Actions (Auth & CRM mutations)
├── store/                # Zustand client stores
└── supabase/             # PostgreSQL migrations and trigger schemas
```

---

## 💻 Local Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/02falgun/KavConsultant.git
cd KavConsultant
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and copy values from `.env.example`:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Database Schema
To push the database schema, tables, triggers, and Row Level Security policies to your remote database:
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new).
2. Copy the contents of the combined migration file:
   📄 **[combined_migration.sql](file:///Users/kavyakumarthakur/KavTech/Projects/kavConsultant/supabase/combined_migration.sql)**
3. Paste the code into the SQL Editor and click **Run**.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your local workspace.

---

## ⚡ Available Commands

*   `npm run dev` — Starts the development server with hot-reloading.
*   `npm run build` — Compiles and bundles optimized production assets.
*   `npm run start` — Runs the compiled Next.js build locally.
*   `npm run typecheck` — Runs strict TypeScript compile diagnostics.
*   `npm run lint` — Verifies code against ESLint code quality guidelines.

---

## 🔒 Row Level Security (RLS) & Tenant Isolation

Every table in the database contains a `tenant_id` column. RLS is enabled globally so users can only view or modify records belonging to their active workspace:
```sql
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_policy" ON public.students
  FOR ALL
  USING (tenant_id = (SELECT auth.jwt() ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (SELECT auth.jwt() ->> 'tenant_id')::uuid);
```
Authentication roles (Admin, Manager, Counsellor) are mapped dynamically inside the `memberships` table, restricting access to settings and analytics sections based on membership status.