# Nucleus Project Status

Last updated: 2026-05-16T13:11+05:30

## Project Summary

Nucleus is a role-based performance goals portal for three user types:

- Employee: drafts goals, submits them, and later updates quarterly achievements.
- Manager: reviews employee goals, approves/rejects them, and gives quarterly feedback.
- Admin/HR: manages quarter windows, governance, exports, unlocks, and audit visibility.

The app is a Next.js 16 project using Supabase Auth and Supabase Postgres.

## Current Stage

Stage 1 foundation is complete enough for the hackathon build.

Stage 2 is complete for the Employee Goal Sheet. The flow has been manually tested in browser against Supabase: add goals, save draft, refresh and reload drafts, delete saved draft rows, submit a valid 100% sheet, and render the submitted read-only view.

Stage 3 is now in progress. The Manager dashboard has a team overview, status badges, summary cards, and a per-employee review route scaffold.

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
- Dashboard header includes a smooth Light/Dark/System theme toggle.
- Each dashboard shows a role-specific Quick Guide card at the top with a 3-step workflow summary (e.g., Employee: Draft Goals → Submit → Quarterly Check-ins). Built with existing Card + lucide-react, zero new dependencies.

### Stage 2 Employee Goal Sheet

- Status: complete and manually tested.
- Employee dashboard renders the Goal Sheet.
- Goal rows include:
  - Thrust Area
  - Goal Title
  - Description
  - Unit of Measurement
  - Target
  - Weightage
  - Delete
- UoM options are `number`, `percentage`, `timeline`, and `zero_based`.
- Timeline goals use a native date input and save their deadline to `target_date`.
- Non-timeline goals use the numeric `target` field.
- Thrust Area options currently are Business, Customer, Operations, People, and Compliance.
- Shared goals lock title and target while leaving weightage editable.
- Weightage indicator shows live `X / 100%`.
- Add Goal works and stops at 8 goals.
- Existing goals load from Supabase for the signed-in employee.
- Save Draft inserts new goals and updates existing goals without duplicate inserts.
- Saved draft goals can be deleted from Supabase.
- Submit Goals runs validation, opens a confirmation dialog, saves drafts, then sets `draft` / `rejected` goals to `submitted`.
- Submitted, approved, and locked goals render read-only.
- Rejected goals stay editable and show a rework notice.
- Status summary banner shows submitted, approved, locked, and rejected states.
- Hydration mismatch warning on the goal sheet was patched with a stable hydration-safe render.

### Stage 3 Manager Review

- Manager dashboard is now titled Team Dashboard.
- Manager dashboard fetches employees where `public.users.manager_id` matches the signed-in manager.
- Team Overview shows each employee with:
  - name/email
  - department
  - submitted goal count
  - total goal count
  - status badge
- Status badges currently include Not Submitted, Awaiting Review, Approved, and Rejected.
- Summary cards show Total Team Members, Awaiting Review, and Approved.
- Review route scaffold exists at `/dashboard/manager/review/[employeeId]`.
- Review route verifies the employee belongs to the signed-in manager before showing data.
- Review route displays the employee's goals and allows managers to edit submitted goal targets/deadlines and weightage.
- Manager edits save back to Supabase only when every goal is at least 10% and total weightage is exactly 100%.
- Manager can approve submitted goals after confirmation.
- Approval saves current manager edits, sets submitted goals to `approved`, and marks `is_locked = true` for compatibility with the existing schema.
- Manager can reject submitted goals with an optional rework reason.
- Reject sets submitted goals to `rejected` and stores the note on `public.users.rejection_reason`.
- Employee dashboard shows the rejection reason in the rework banner.
- Employee resubmission clears `public.users.rejection_reason`.

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
- `public.goals`, including `thrust_area`, `description`, and `target_date`
- `public.quarterly_updates`
- `public.audit_logs`
- `public.quarter_windows`
- `public.handle_new_user()` trigger function
- `on_auth_user_created` trigger
- RLS enabled on all main tables
- Basic permissive authenticated policies for hackathon speed, including goal delete for draft cleanup
- Demo role/profile updates for employee, manager, and admin accounts
- Employee-to-manager link for `employee@test.com`
- `public.users.rejection_reason` for future Manager rejection notes

## Supabase Setup Notes

If setting up from scratch, do this in Supabase:

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

If the Stage 1 migration was already run before Thrust Area was added, run this in Supabase SQL Editor:

```sql
alter table public.goals add column if not exists thrust_area text;
```

If the Stage 1 migration was already run before Description and Timeline date support were added, run this in Supabase SQL Editor:

```sql
alter table public.goals add column if not exists description text;
alter table public.goals add column if not exists target_date date;
```

If the Stage 1 migration was already run before Manager rejection-note support was added, run this in Supabase SQL Editor:

```sql
alter table public.users add column if not exists rejection_reason text;

drop policy if exists "Managers can update direct report rejection reasons" on public.users;

create policy "Managers can update direct report rejection reasons"
  on public.users
  for update
  to authenticated
  using (manager_id = auth.uid())
  with check (manager_id = auth.uid());
```

If the Stage 1 migration was already run before saved-goal delete was added, run this in Supabase SQL Editor:

```sql
drop policy if exists "Authenticated users can delete goals" on public.goals;

create policy "Authenticated users can delete goals"
  on public.goals
  for delete
  to authenticated
  using (true);
```

## Verification Status

Latest local verification:

- `pnpm lint` passes.
- `pnpm build` passes.

Known build note:

- Next.js 16 warns that the `middleware.ts` file convention is deprecated in favor of the newer proxy convention. It is only a warning right now and does not block the app.

## Stage 3 Starting Point

Continue the Manager review and approval workflow.

Remaining Stage 3 order:

1. Manually test manager approve/reject from the browser.
2. Add any needed polish to Manager Review after testing.
3. Decide whether to keep or retire the legacy `is_locked` boolean after hackathon flow stabilizes.

## Useful Files

- Login page: `src/app/login/page.tsx`
- Employee dashboard: `src/app/dashboard/employee/page.tsx`
- Manager dashboard: `src/app/dashboard/manager/page.tsx`
- Manager review route: `src/app/dashboard/manager/review/[employeeId]/page.tsx`
- Admin dashboard: `src/app/dashboard/admin/page.tsx`
- Dashboard shell: `src/components/dashboard-shell.tsx`
- Theme toggle: `src/components/theme-toggle.tsx`
- Goal sheet: `src/components/goals/goal-sheet.tsx`
- Goal row: `src/components/goals/goal-form-row.tsx`
- Weightage indicator: `src/components/goals/weightage-indicator.tsx`
- Quick guide: `src/components/quick-guide.tsx`
- Goal validation: `src/lib/validate-goals.ts`
- Team overview: `src/components/manager/team-overview.tsx`
- Employee goal review: `src/components/manager/employee-goal-review.tsx`
- Server auth guard: `src/lib/auth.ts`
- Browser Supabase client: `src/lib/supabase.ts`
- Server Supabase client: `src/lib/supabase-server.ts`
- Env validation: `src/lib/env.ts`
- Middleware: `src/middleware.ts`
- Database migration: `supabase/migrations/202605160001_stage1_foundation.sql`

## Current Limitations

- Manager and Admin dashboards are still placeholders.
- Manager review/approval is not implemented yet.
- Admin quarter management UI is not implemented yet.
- RLS policies are intentionally permissive for hackathon progress and should be tightened after core flows work.
- Final Thrust Area labels can still be adjusted if Atomberg provides an exact list.
