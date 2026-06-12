# KavConsultant Architecture

## Platform Summary
KavConsultant is a multi-tenant SaaS CRM for education consultancies built on Next.js 14 App Router, Supabase, PostgreSQL, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, React Hook Form, Zod, Recharts, Razorpay, and Sentry.

## Core Principles
- Every business record carries `tenant_id`.
- All tenant-scoped access is enforced by Supabase Row Level Security.
- Repository pattern isolates database access from UI and server actions.
- Feature-based architecture owns domain logic end to end.
- Server Actions handle authenticated mutations whenever practical.
- Mobile-first UI with fully supported dark and light themes.

## Folder Structure
```text
app/
  (public)/
  (auth)/
  (dashboard)/
  api/
components/
  ui/
  shared/
  layout/
  feedback/
  forms/
features/
  auth/
  tenants/
  dashboard/
  leads/
  students/
  applications/
  tasks/
  communications/
  notes/
  documents/
  payments/
  reports/
  settings/
lib/
  supabase/
  auth/
  db/
  repositories/
  validations/
  permissions/
  logger/
  monitoring/
  utils/
  constants/
hooks/
store/
types/
server-actions/
config/
tests/
scripts/
styles/
supabase/
  migrations/
  seed/
  policies/
  functions/
docs/
```

## Naming Conventions
- Routes and folders use kebab-case.
- React components use PascalCase.
- Hooks use camelCase with `use`.
- Server Actions use verb-first names.
- Repository methods use explicit CRUD verbs.
- Database tables use snake_case.
- Zod schemas use `entitySchema`, `createEntitySchema`, and `updateEntitySchema`.

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_ENABLE_MOCKS`
- `NEXT_PUBLIC_DEFAULT_THEME`
- `DATABASE_URL`
- `PGBOUNCER_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

## Shared Component Architecture
- `components/ui` contains shadcn/ui primitives and wrappers.
- `components/shared` contains cross-domain building blocks.
- `components/layout` contains shell, navigation, and tenant switcher components.
- `components/forms` contains form controls integrated with React Hook Form.
- `components/feedback` contains loading, empty, error, dialog, and toast primitives.

## Feature Architecture
Each feature owns its own UI, schemas, repositories, queries, actions, state, types, and utilities. Cross-feature reuse must move to `components/shared` or `lib` only after clear reuse is proven.

## State Management Architecture
- TanStack Query manages all server state.
- Zustand manages only ephemeral client state.
- React Hook Form manages form-local draft state.
- Server Components fetch read-heavy data directly when caching fits.

## API Architecture
- Server Actions are the default for internal mutations.
- Route handlers are reserved for webhooks, public callbacks, and integrations.
- All request and response payloads are typed through Zod.
- Repository methods never leak raw database rows into UI code.

## Middleware Architecture
- Middleware handles auth redirects and app shell routing only.
- Business authorization stays in server actions and RLS.
- Tenant routing can be normalized through slug or subdomain parsing.

## Authentication Architecture
- Supabase Auth is the identity source.
- `users` stores the application profile.
- `memberships` maps users to tenants and roles.
- Session handling is server-first and role-aware.

## Route Protection Strategy
- Public routes remain unauthenticated.
- Auth routes handle sign in and invitation flows.
- Dashboard routes require a valid Supabase session and active membership.
- Sensitive mutation paths require tenant membership plus role checks.

## Database Access Layer Strategy
- `lib/supabase` owns client factories.
- `lib/repositories` contains all DB access.
- `lib/db` holds transaction and query helpers.
- `lib/permissions` centralizes tenant and role checks.

## Error Handling Strategy
- Expected errors are normalized into typed domain errors.
- Unexpected failures bubble to global error boundaries and Sentry.
- Validation errors stay inside server actions and forms.

## Logging Strategy
- Structured JSON logs on the server.
- Include `tenant_id`, `user_id`, and `request_id` when available.
- Keep PII, secrets, and payment payloads out of logs.

## Deployment Architecture
- Next.js deploys on Vercel or an equivalent platform.
- Supabase hosts Postgres, Auth, Storage, Realtime, and edge functions.
- Migrations run via CI/CD.
- Preview deployments use isolated Supabase environments.
- preview deployments use isolated supabase environments
migrations ru via CI/CD isolates supabase environments 
