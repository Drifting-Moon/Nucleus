# Nucleus Project Status

Last updated: 2026-05-16 (quarter overlap priority)

## Project Summary

Nucleus is a role-based performance goals portal for three user types:

- **Employee:** One-time goal setting during the goal-setting window, then quarterly check-ins on locked goals only.
- **Manager:** Reviews submitted goal sheets (approve/reject), then quarterly feedback when check-in windows are open.
- **Admin/HR:** Sets quarter windows, pushes shared KPIs, tracks completion, exports data, unlocks goals with audit trail.

The app is a Next.js 16 project using Supabase Auth and Supabase Postgres.

**Repository:** `https://github.com/Drifting-Moon/Nucleus`

## Current Stage

| Stage                         | Status   | Notes                                                                 |
| ----------------------------- | -------- | --------------------------------------------------------------------- |
| Stage 1 — Foundation          | Complete | Auth, routing, DB, demo users                                         |
| Stage 2 — Employee goal sheet | Complete | BRD one-time submission + window gating enforced                      |
| Stage 3 — Manager goal review | Complete | Tabbed dashboard, back navigation, submitted-only review queue        |
| Stage 4 — Quarterly check-ins | Complete | Windows, employee check-ins, manager feedback                         |
| Stage 5 — Admin governance    | Complete | Completion, export, unlock, audit, push shared goal                 |
| Polish — UX & demo readiness  | Complete | Branding, avatars, print PDF, locked goal cards, sticky actions       |
| Stage 6 — Submission polish   | Complete | Weighted scores, org hierarchy, check-in history, rich demo seed      |

## Requirements Coverage (Role × Capability)

| Role | Responsibility | System capability | Status |
| ---- | -------------- | ----------------- | ------ |
| **Employee** | Draft goals | Create/edit before submit (goal-setting window) | Done |
| **Employee** | Quarterly achievements | Check-in form when quarter window open | Done |
| **Employee** | Progress status | Not Started / On Track / Completed per goal | Done |
| **Employee** | — | View locked goals (read-only after approval) | Done |
| **Employee** | — | Input actuals (achievement + auto score) | Done |
| **Manager** | Approve goals | Team dashboard + review page, inline edit, approve/reject | Done |
| **Manager** | Quarterly check-ins | Quarterly Feedback tab + per-employee review | Done |
| **Manager** | Log feedback | Rejection note + `manager_feedback` per quarter | Done — employee **Manager feedback** timeline |
| **Manager** | — | Team dashboard | Done |
| **Admin** | Configure cycles | Quarter Windows (goal_setting, Q1–Annual) | Done |
| **Admin** | Org hierarchy | Assign managers (`manager_id`) | Done — **Org Hierarchy** tab |
| **Admin** | Monitor completion | Completion dashboard (employee + manager tables) | Done |
| **Admin** | — | Exception handling (unlock goals) | Done |
| **Admin** | — | Audit logs | Done |
| **Admin** | — | Push shared / forced KPIs | Done |
| **Admin** | — | Export reports (CSV/Excel) | Done |
| **Admin** | Manage users | People tab to create/manage employees, managers, and admins | Done |
| **Admin** | Escalate | Escalation center to highlight completion bottlenecks | Done |

## BRD Workflow (Canonical)

### Phase 1 — Goal setting (once per cycle)

1. Admin opens **goal_setting** window dates.
2. Employee drafts up to 8 goals (100% weightage total) and submits.
3. Manager reviews **submitted** goals only → approve (lock) or reject (rework).
4. After approval, goals are **`status: locked`** — no further edits without Admin unlock.

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
- `DashboardShell`: **Nucleus** branding, logout, theme toggle, **Export PDF** (`window.print()`), optional **Back to team** on manager detail pages.
- Collapsible role-specific Quick Guide on each dashboard.
- Sonner toasts for save/submit/approve actions.

### Stage 2 — Employee Goal Sheet

- Goal sheet with workflow stepper and summary cards (quarter status card highlighted).
- Fields: Thrust Area, Title, Description, UoM, Target, Weightage, Delete.
- UoM: `number`, `percentage`, `timeline`, `zero_based`.
- Thrust areas: Business, Customer, Operations, People, Compliance.
- Validation: UoM required, weightage ≥ 10%, total = 100% to submit, max 8 goals.
- **Goal-setting window:** `isGoalSettingOpen()` — shows **Window closed** when outside admin dates.
- **One-time submission:** If any goal is `approved`/`locked`, sheet is read-only; add/save/submit blocked (client + DB check).
- **Rework:** Rejected goals editable when goal-setting open or in rework (no locked goals).
- **Shared/forced goals** (`is_shared`): title, target, thrust area, UoM, description locked; weightage editable.
- Submitted goals read-only until manager acts; resubmit clears `rejection_reason`.
- **Locked goal display:** `LockedGoalCard` with labeled fields; timeline shows due date, not raw numbers.
- **Sticky actions:** Save Draft / Submit bar sticks to bottom while scrolling.

### Stage 3 — Manager Goal Review

- Manager dashboard uses **tabs:** Goal Review | Quarterly Feedback (`ManagerTabs`).
- Goal Review: team list with avatars, status badges, **clickable rows** → review page.
- Empty state: “Nothing to review right now…” when no submissions pending.
- Review page: **only `submitted` goals** shown for approve/reject (locked/rejected history hidden).
- Manager can edit submitted targets, deadlines, weightage; approve requires 100% on submitted set only.
- Approve → `status: locked`; Reject → `rejected` + note on `users.rejection_reason`.
- **Back to team** link on review and check-in detail pages.

### Stage 4 — Quarterly Check-ins

#### Admin quarter windows

- Admin tab **Quarter Windows:** `goal_setting`, `q1`, `q2`, `q3`, `annual` with start/end dates.
- Save validates end ≥ start. If multiple check-in windows overlap (demo/hackathon edge case), `getActiveWindow()` always picks **Q1 → Q2 → Q3 → Annual** (matches workflow stepper; not DB row order).

#### Employee check-ins

- `CheckinGate` below goal sheet; opens when employee has locked goals and no draft/submitted goals blocking.
- Closed window: blocked message + next window date (`formatDisplayDate`).
- Open window: achievement + status per locked goal.
- **Scoring** (`calculate-score.ts` + `score_direction` on goals):
  - `higher` (default): achievement ÷ target
  - `lower`: target ÷ achievement
  - `zero_based`: achievement 0 → 100%, else 0%
  - `timeline`: date compare (on/before target date = 100%)
- **Score formula hint** (info icon) shows BRD formula per row.
- Score display: green ≥ 100%, yellow 50–99%, red &lt; 50% (dark-mode safe).
- Submit writes `quarterly_updates` with `score`, `submitted_at`, `achievement_date`.

#### Manager check-in review

- **Quarterly Feedback** tab when a check-in window is open; blocked message when closed.
- Per-employee: pending / submitted / feedback saved.
- Detail page: read-only planned vs actual; one manager comment per employee per quarter (`manager_feedback`).

### Stage 5 — Admin Governance

- **Admin dashboard tabs:** **Completion** | **People** | **Escalations** | **Analytics** | **Org Hierarchy** | **Quarter Windows** | **Export** | **Push Shared Goal** | **Audit Log** | **Unlock Goals**.
- **Completion dashboard:** employee and manager tables with avatars; Q1/Q2/Q3/Annual cells.
- **People Management:** UI to create and manage users (roles, managers) leveraging `/api/admin/users`.
- **Escalation Center:** dedicated module highlighting employees who missed goal-setting or check-in deadlines.
- **Export:** CSV and Excel via `/api/admin/export`.
- **Unlock & edit:** search employee, edit locked goal, save & re-lock; changes audit-logged.
- **Audit log:** viewer for `audit_logs` (field-level unlock edits + shared goal assignments).
- **Push shared goal:** multi-select employees, assign forced KPI (`is_shared = true`, draft).

### Polish Phase (UX)

- Print-friendly layout (`print:hidden` on chrome; print CSS in `globals.css`).
- User initials avatars on manager team list and admin completion tables.
- Human-readable dates via `formatDisplayDate()`.
- Stronger workflow stepper (current step filled; completed steps green).
- Manager approve flow uses **`status: locked`** (app no longer writes `is_locked`).

### Stage 6 — Submission polish

- **Weighted overall score** (employee summary card): Σ (avg score per goal × weightage) when check-ins submitted.
- **Team avg score** (manager Goal Review tab): same formula across direct reports.
- **Org hierarchy** (Admin tab): assign `manager_id` per employee with Save.
- **Past check-ins** (employee): read-only table grouped by quarter.
- **Rich demo seed** (`supabase/seed/demo_seed.sql`): 5 locked goals incl. shared KPI, Q1+Q2 check-ins, audit rows.

### Stage 6 — Not implemented (optional / submission prep)

- Unified comment timeline UI
- Admin analytics charts (recharts)
- Email notifications (Resend)
- Completion dashboard escalation highlights
- Vercel deploy + architecture diagram (manual submission steps)

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

**Note:** `goals.is_locked` column exists from Stage 1 but the app relies on `status` (`approved` / `locked`) for lock semantics.

## Supabase Setup

### Fresh setup (run in order)

1. `supabase/migrations/202605160001_stage1_foundation.sql`
2. `supabase/migrations/202605160002_stage4_quarterly.sql`
3. `supabase/migrations/202605160003_goals_updated_at.sql`
4. `supabase/migrations/202605160004_goals_score_direction.sql`
5. `supabase/migrations/202605170001_escalation_module.sql`
6. Create Auth users: `employee@test.com`, `manager@test.com`, `admin@test.com` (Or run `supabase/seed/reset_to_core_demo_users.sql` / `supabase/seed/demo_org_15_employees.sql` in SQL Editor).
7. Confirm `public.users` roles and employee `manager_id` → manager
8. `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (required for Admin People Management).

### Demo / test tips

- Set **goal_setting** and check-in quarter dates in Admin → Quarter Windows so **today** falls inside the window you want to test. Prefer **non-overlapping** Q1–Annual ranges in production; overlapping dates are safe but always surface the earliest quarter in cycle order.
- Optional: `supabase/seed/demo_seed.sql` (skips if employee already has goals).
- Reset demo employee goals/check-ins via Supabase SQL (see README) before a clean goal-setting run; **Unlock Goals** edits locked targets only.
- Demo PDF: any dashboard → **Export PDF** → browser print preview.

## Verification Status

- `pnpm lint` — passes
- `pnpm build` — passes
- `pnpm test` — unit tests for `validate-goals`, `calculate-score`, `calculate-weighted-score`
- Next.js 16 warns `middleware.ts` is deprecated (proxy convention) — non-blocking
- Full cycle browser-tested recommended before judging

## Next Up

1. Deploy to Vercel + add live URL to README.
2. Run `demo_seed.sql` on a clean demo employee before judging.
3. Architecture diagram (Excalidraw) for submission PDF.
4. Optional: email notifications.
5. Tighten RLS for production; drop unused `goals.is_locked` column in a future migration.

## Evaluator highlights (implemented)

- **Admin analytics** — Recharts dashboard (completion, scores, QoQ, manager effectiveness).
- **Completion escalations** — employees highlighted when goal-setting ended without full submit/approve.
- **Employee feedback timeline** — rejection notes + quarterly manager comments.
- **Friendly API errors** — `src/lib/map-supabase-error.ts`.
- **Role badges** — visible in dashboard header per role.

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
- `src/components/goals/locked-goal-card.tsx`
- `src/components/goals/weightage-indicator.tsx`
- `src/components/employee/workflow-stepper.tsx`
- `src/components/employee/goal-summary-cards.tsx`
- `src/components/employee/checkin-history.tsx`
- `src/lib/calculate-weighted-score.ts`
- `src/lib/validate-goals.ts`
- `src/lib/goal-metrics.ts`
- `src/lib/employee-workflow.ts`
- `src/lib/format-goal-target.ts`

**Check-ins**

- `src/components/checkins/checkin-gate.tsx`
- `src/components/checkins/checkin-form.tsx`
- `src/components/checkins/checkin-row.tsx`
- `src/components/checkins/score-display.tsx`
- `src/components/score-formula-hint.tsx`
- `src/lib/calculate-score.ts`
- `src/lib/score-formula.ts`
- `src/lib/get-active-window.ts`
- `src/lib/validate-checkin.ts`
- `src/lib/quarter-labels.ts`
- `src/lib/format-date.ts`

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
- `src/components/admin/people-management.tsx`
- `src/components/admin/escalation-center.tsx`
- `src/components/admin/quarter-window-form.tsx`
- `src/components/admin/export-button.tsx`
- `src/components/admin/push-shared-goal-form.tsx`
- `src/components/admin/unlock-tool.tsx`
- `src/components/admin/unlock-dialog.tsx`
- `src/components/admin/audit-log-viewer.tsx`
- `src/components/admin/org-hierarchy-form.tsx`
- `src/lib/admin/completion-data.ts`
- `src/lib/admin/escalation-data.ts`
- `src/lib/build-export-data.ts`
- `src/lib/write-audit-log.ts`

**Shared**

- `src/components/dashboard-shell.tsx`
- `src/components/print-dashboard-button.tsx`
- `src/components/user-avatar.tsx`
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
- `supabase/migrations/202605170001_escalation_module.sql`

## Current Limitations

- **Feedback logs:** timeline on employee dashboard; no threaded per-goal comment history.
- RLS remains permissive for hackathon/demo speed.
- `goals.is_locked` column unused by app (legacy from schema); lock = `status` in (`approved`, `locked`).
- Push shared goal skips employees who already have locked goals for the cycle.
- Vercel live URL and architecture diagram still manual submission tasks.
