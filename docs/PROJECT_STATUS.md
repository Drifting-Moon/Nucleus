# Nucleus Project Status

Last updated: 2026-05-16

## Project Summary

Nucleus is a role-based performance goals portal for three user types:

- **Employee:** One-time goal setting during the goal-setting window, then quarterly check-ins on locked goals only.
- **Manager:** Reviews submitted goal sheets (approve/reject), then quarterly feedback when check-in windows are open.
- **Admin/HR:** Sets quarter windows, pushes shared KPIs, tracks completion, exports data, unlocks goals with audit trail.

The app is a Next.js 16 project using Supabase Auth and Supabase Postgres.

## Current Stage

| Stage                         | Status   | Notes                                                                 |
| ----------------------------- | -------- | --------------------------------------------------------------------- |
| Stage 1 — Foundation          | Complete | Auth, routing, DB, demo users                                         |
| Stage 2 — Employee goal sheet | Complete | BRD one-time submission + window gating enforced                      |
| Stage 3 — Manager goal review | Complete | Tabbed dashboard, back navigation, submitted-only review queue        |
| Stage 4 — Quarterly check-ins | Complete | Windows, employee check-ins, manager feedback                         |
| Stage 5 — Admin governance    | Complete | Completion, export, unlock, audit, push shared goal                   |

## BRD Workflow (Canonical)

### Phase 1 — Goal setting (once per cycle)

1. Admin opens **goal_setting** window dates.
2. Employee drafts up to 8 goals (100% weightage total) and submits.
3. Manager reviews **submitted** goals only → approve (lock) or reject (rework).
4. After approval, goals are **locked** — no further edits without Admin unlock.

### Phase 2 — Quarterly check-ins (Q1, Q2, Q3, Annual)

1. Employee logs **actual achievement** and status on **locked goals only** (no new goal submission).
2. Scores auto-calculate; manager adds feedback when the check-in window is open.
3. Admin completion dashboard reflects submission status per quarter.

## Implemented So Far

### Frontend / App

- Next.js app scaffold with App Router.
- Login at `/login` with role selector (Employee, Manager, Admin).
- Demo credentials prefilled: `employee@test.com`, `manager@test.com`, `admin@test.com` (password `password123`).
- Login verifies selected role against `public.users.role`.
- Dashboard routes (server-side role guards on all):
  - `/dashboard/employee`
  - `/dashboard/manager`
  - `/dashboard/manager/review/[employeeId]`
  - `/dashboard/manager/checkin/[employeeId]`
  - `/dashboard/admin`
  - `/api/admin/export`
- `DashboardShell`: logout, theme toggle, optional **Back to team** link on manager detail pages.
- Role-specific Quick Guide cards on each dashboard.
- Sonner toasts for save/submit/approve actions.

### Stage 2 — Employee Goal Sheet

- Goal sheet with workflow stepper and summary cards.
- Fields: Thrust Area, Title, Description, UoM, Target, Weightage, Delete.
- UoM: `number`, `percentage`, `timeline`, `zero_based`.
- Thrust areas: Business, Customer, Operations, People, Compliance.
- Validation: UoM required, weightage ≥ 10%, total = 100% to submit, max 8 goals.
- **Goal-setting window:** `isGoalSettingOpen()` — shows **Window closed** when outside admin dates.
- **One-time submission:** If any goal is `approved`/`locked`, sheet is read-only; add/save/submit blocked (client + DB check).
- **Rework:** Rejected goals editable when goal-setting open or in rework (no locked goals).
- **Shared/forced goals** (`is_shared`): title, target, thrust area, UoM, description locked; weightage editable.
- Submitted goals read-only until manager acts; resubmit clears `rejection_reason`.
### Stage 3 — Manager Goal Review

- Manager dashboard uses **tabs:** Goal Review | Quarterly Feedback (`ManagerTabs`).
- Goal Review: team list with status badges (Not Submitted, Awaiting Review, Approved, Rejected).
- Review page: **only `submitted` goals** shown for approve/reject (locked/rejected history hidden).
- Manager can edit submitted targets, deadlines, weightage; approve requires 100% on submitted set only.
- Approve → `approved` + `is_locked = true`; Reject → `rejected` + note on `users.rejection_reason`.
- **Back to team** link on review and check-in detail pages.

### Stage 4 — Quarterly Check-ins

#### Admin quarter windows

- Admin tab **Quarter Windows:** `goal_setting`, `q1`, `q2`, `q3`, `annual` with start/end dates.

#### Employee check-ins

- `CheckinGate` below goal sheet; gated until all goals approved/locked.
- Closed window: blocked message + next window date from `getNextWindow()`.
- Open window: achievement + status (`not_started`, `on_track`, `completed`) per locked goal.
- **Scoring** (`calculate-score.ts`):
  - `higher` (default): achievement ÷ target
  - `lower`: target ÷ achievement
  - `zero_based`: achievement 0 → 100%, else 0%
  - `timeline`: date compare (on/before target date = 100%)
- Score display: green ≥ 100%, yellow 50–99%, red &lt; 50%.
- Submit writes `quarterly_updates` with `score`, `submitted_at`, `achievement_date`.

#### Manager check-in review

- **Quarterly Feedback** tab when a check-in window is open; blocked message when closed.
- Per-employee: pending / submitted / feedback saved.
- Detail page: read-only planned vs actual; one manager comment per employee per quarter (`manager_feedback`).

### Stage 5 — Admin Governance

- Admin dashboard tabs: **Completion** | **Quarter Windows** | **Export** | **Push Shared Goal** | **Audit Log** | **Unlock Goals**.
- **Completion dashboard:** employee and manager rows; Q1/Q2/Q3/Annual cells (submitted / pending / N/A).
- **Export:** CSV and Excel via `/api/admin/export` (employee, goal, targets, quarterly achievements/scores).
- **Unlock & edit:** search employee, edit locked goal target/weightage, save & re-lock.
- **Audit log:** viewer for `audit_logs` (unlock field changes + shared goal assignments).
- **Push shared goal:** multi-select employees, assign forced KPI (`is_shared = true`, draft); skips employees with locked goals.

### Auth / Routing

- `src/lib/supabase.ts` (browser), `src/lib/supabase-server.ts` (server).
- Middleware protects `/dashboard/*`, role-based redirects.
- `src/lib/auth.ts` — `requireRole()` on server pages.
- `src/lib/auth-api.ts` — admin export route guard.

### Database

| Migration | Purpose |
| --------- | ------- |
| `202605160001_stage1_foundation.sql` | Core tables, RLS, demo users |
| `202605160002_stage4_quarterly.sql` | `achievement_date`, `score`, `submitted_at` on `quarterly_updates` |
| `202605160003_goals_updated_at.sql` | `goals.updated_at` + trigger |
| `202605160004_goals_score_direction.sql` | `goals.score_direction` (`higher` \| `lower`) |

**Tables:** `users`, `goals`, `quarterly_updates`, `quarter_windows`, `audit_logs`

## Supabase Setup

### Fresh setup (run in order)

1. `supabase/migrations/202605160001_stage1_foundation.sql`
2. `supabase/migrations/202605160002_stage4_quarterly.sql`
3. `supabase/migrations/202605160003_goals_updated_at.sql`
4. `supabase/migrations/202605160004_goals_score_direction.sql`
5. Create Auth users: `employee@test.com`, `manager@test.com`, `admin@test.com`
6. Confirm `public.users` roles and employee `manager_id` → manager
7. `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Demo / test tips

- Set **goal_setting** and check-in quarter dates in Admin → Quarter Windows so **today** falls inside the window you want to test.
- Optional: `supabase/seed/demo_seed.sql` (skips if employee already has goals).
- Clear test goals via Supabase SQL or Admin unlock if needed before a clean demo run.

## Verification Status

- `pnpm lint` — passes
- `pnpm build` — passes
- Next.js 16 warns `middleware.ts` is deprecated (proxy convention) — non-blocking
- End-to-end browser test recommended after DB migrations

## Next Up

1. Browser-test full cycle: goal setting → submit → manager approve → check-in → manager feedback → admin export.
2. Tighten RLS policies for production.
3. Align thrust-area labels with Atomberg final list if needed.
4. Optional: check-in history view for past quarters (read-only).

## Useful Files

**App routes**

- `src/app/login/page.tsx`
- `src/app/dashboard/employee/page.tsx`
- `src/app/dashboard/manager/page.tsx`
- `src/app/dashboard/manager/review/[employeeId]/page.tsx`
- `src/app/dashboard/manager/checkin/[employeeId]/page.tsx`
- `src/app/dashboard/admin/page.tsx`
- `src/app/api/admin/export/route.ts`

**Goals**

- `src/components/goals/goal-sheet.tsx`
- `src/components/goals/goal-form-row.tsx`
- `src/components/goals/weightage-indicator.tsx`
- `src/components/employee/workflow-stepper.tsx`
- `src/components/employee/goal-summary-cards.tsx`
- `src/lib/validate-goals.ts`
- `src/lib/goal-metrics.ts`
- `src/lib/employee-workflow.ts`

**Check-ins**

- `src/components/checkins/checkin-gate.tsx`
- `src/components/checkins/checkin-form.tsx`
- `src/components/checkins/checkin-row.tsx`
- `src/components/checkins/score-display.tsx`
- `src/lib/calculate-score.ts`
- `src/lib/get-active-window.ts`
- `src/lib/validate-checkin.ts`
- `src/lib/quarter-labels.ts`

**Manager**

- `src/components/manager/manager-tabs.tsx`
- `src/components/manager/team-overview.tsx`
- `src/components/manager/employee-goal-review.tsx`
- `src/components/manager/team-checkin-overview.tsx`
- `src/components/manager/employee-checkin-review.tsx`
- `src/lib/team-checkin-status.ts`

**Admin**

- `src/components/admin/admin-tabs.tsx`
- `src/components/admin/completion-dashboard.tsx`
- `src/components/admin/quarter-window-form.tsx`
- `src/components/admin/export-button.tsx`
- `src/components/admin/push-shared-goal-form.tsx`
- `src/components/admin/unlock-tool.tsx`
- `src/components/admin/unlock-dialog.tsx`
- `src/components/admin/audit-log-viewer.tsx`
- `src/lib/admin/completion-data.ts`
- `src/lib/build-export-data.ts`
- `src/lib/write-audit-log.ts`

**Shared**

- `src/components/dashboard-shell.tsx`
- `src/components/quick-guide.tsx`
- `src/components/theme-toggle.tsx`
- `src/components/app-toaster.tsx`
- `src/lib/auth.ts`
- `src/middleware.ts`

**Migrations**

- `supabase/migrations/202605160001_stage1_foundation.sql`
- `supabase/migrations/202605160002_stage4_quarterly.sql`
- `supabase/migrations/202605160003_goals_updated_at.sql`
- `supabase/migrations/202605160004_goals_score_direction.sql`

## Current Limitations

- RLS remains permissive for hackathon/demo speed — tighten before production.
- `is_locked` boolean and `status = 'locked'` both used; consider consolidating later.
- Check-in history (view/edit past quarters) not implemented.
- Push shared goal requires `score_direction` migration; employees with locked goals are skipped.
- Manager/employee flows should be re-verified in browser after each schema change.
