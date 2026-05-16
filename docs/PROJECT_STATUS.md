# Nucleus Project Status

Last updated: 2026-05-16

## Project Summary

Nucleus is a role-based performance goals portal for three user types:

- Employee: drafts goals, submits them, and later updates quarterly achievements.
- Manager: reviews employee goals, approves/rejects them, and gives quarterly feedback.
- Admin/HR: manages quarter windows, governance, exports, unlocks, and audit visibility.

The app is a Next.js 16 project using Supabase Auth and Supabase Postgres.

## Current Stage

Stage 1 foundation is mostly complete. The app has authentication wiring, role-based routing, dashboard shells, and the initial Supabase schema migration.

Stage 2 should start with the employee goal sheet.

## Implemented So Far

### Frontend/App

- Next.js app scaffold.
- Login page at `/login`.
- Login role selector for Employee, Manager, and Admin.
- Role selector prefills demo credentials:
  - `employee@test.com`
  - `manager@test.com`
  - `admin@test.com`
  - password placeholder: `password123`
- Login now verifies the selected role against `public.users.role`.
- If selected role and real account role do not match, the app signs out and shows an error.
- Dashboard routes:
  - `/dashboard/employee`
  - `/dashboard/manager`
  - `/dashboard/admin`
- Each dashboard has a logout button.
- Dashboard pages perform server-side role checks before rendering.
- Shared `DashboardShell` client component keeps logout interactivity separate from server guards.
- App metadata title is `Nucleus`.

### Auth/Routing

- Supabase browser client in `src/lib/supabase.ts`.
- Supabase server client in `src/lib/supabase-server.ts`.
- Middleware protects `/dashboard/*`, redirects unauthenticated users to `/login`, and routes logged-in users by role.
- Server-side role guard lives in `src/lib/auth.ts`.
- Environment variable validation lives in `src/lib/env.ts`.

### Database

Migration file:

`supabase/migrations/202605160001_stage1_foundation.sql`

It defines:

- `public.users`
- `public.goals`
- `public.quarterly_updates`
- `public.audit_logs`
- `public.quarter_windows`
- `public.handle_new_user()` trigger function
- `on_auth_user_created` trigger
- RLS enabled on all main tables
- Basic permissive authenticated policies for hackathon speed
- Demo role/profile updates for employee, manager, and admin accounts
- Employee-to-manager link for `employee@test.com`

## Supabase Setup Needed Before Stage 2

Do this in Supabase before building the goal sheet:

1. Open Supabase SQL Editor.
2. Run the contents of:

   `supabase/migrations/202605160001_stage1_foundation.sql`

3. Confirm the three demo users exist in Supabase Auth:

   - `employee@test.com`
   - `manager@test.com`
   - `admin@test.com`

4. Confirm `public.users` has matching rows for those users.
5. Confirm roles are set correctly:

   - employee user role: `employee`
   - manager user role: `manager`
   - admin user role: `admin`

6. Confirm the employee row has `manager_id` set to the manager user's id.
7. Keep these env vars in `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Important: do not run old SQL snippets that update `manager_id` without a `WHERE` clause. That would assign the manager to every user.

## Verification Status

Latest local verification:

- `pnpm lint` passes.
- `pnpm build` passes.

Known build note:

- Next.js 16 warns that the `middleware.ts` file convention is deprecated in favor of the newer proxy convention. It is only a warning right now and does not block the app.

## Stage 2 Starting Point

Build the Employee Goal Sheet first.

Recommended implementation order:

1. Create a goal sheet UI on `/dashboard/employee`.
2. Let employee add/edit draft goals.
3. Enforce validation before submit:
   - maximum 8 goals
   - each goal weightage at least 10
   - total weightage exactly 100
   - required UoM: `number`, `percentage`, `timeline`, or `zero_based`
4. Save drafts to `public.goals`.
5. Submit goals by setting `status = 'submitted'`.
6. Keep manager/admin flows minimal until employee create/submit is solid.

## Useful Files

- Login page: `src/app/login/page.tsx`
- Employee dashboard: `src/app/dashboard/employee/page.tsx`
- Manager dashboard: `src/app/dashboard/manager/page.tsx`
- Admin dashboard: `src/app/dashboard/admin/page.tsx`
- Dashboard shell: `src/components/dashboard-shell.tsx`
- Server auth guard: `src/lib/auth.ts`
- Browser Supabase client: `src/lib/supabase.ts`
- Server Supabase client: `src/lib/supabase-server.ts`
- Env validation: `src/lib/env.ts`
- Middleware: `src/middleware.ts`
- Database migration: `supabase/migrations/202605160001_stage1_foundation.sql`

## Current Limitations

- The dashboards are still placeholders.
- The goal sheet is not implemented yet.
- Manager review/approval is not implemented yet.
- Admin quarter management UI is not implemented yet.
- RLS policies are intentionally permissive for hackathon progress and should be tightened after core flows work.
- The SQL migration has been added to the repo, but it must still be applied in Supabase.
