# Nucleus

Nucleus is a role-based performance goals portal for employees, managers, and admins — goal setting once per cycle, quarterly check-ins, and admin governance.

## Demo credentials

| Role | Email | Password |
| ---- | ----- | -------- |
| Employee | `employee@test.com` | `password123` |
| Manager | `manager@test.com` | `password123` |
| Admin | `admin@test.com` | `password123` |

Select the matching role on the login screen.

## Live URL

_Add your Vercel deployment URL here after `vercel deploy`._

## Evaluator demo script (~5 minutes)

Run these steps in order so every role sees the full BRD flow:

1. **Admin** — Log in → **Quarter Windows** → set `goal_setting` and `q1` so **today** falls inside both date ranges → Save.
2. **Employee** — Log in → add 3–5 goals (each ≥10% weightage, **total = 100%**) → **Submit Goals**.
3. **Manager** — Log in → **Goal Review** tab → open the employee → **Approve Goals** (button enables at 100% on submitted set).
4. **Employee** — Refresh → **Quarterly Check-ins** → enter achievement + status → submit for the active quarter.
5. **Manager** — **Quarterly Feedback** tab → open employee → save manager comment.
6. **Admin** — **Completion** tab (escalations highlighted) → **Analytics** → **Export** CSV.

Optional: run `supabase/seed/demo_seed.sql` on a clean employee account for pre-locked goals and sample check-ins.

### BRD checklist (Phase 1 & 2)

| Rule | Where enforced |
| ---- | -------------- |
| Max 8 goals | `src/lib/validate-goals.ts` + UI |
| Min 10% per goal | `validate-goals.ts` + DB constraint |
| Total weightage = 100% to submit | `validate-goals.ts` + weightage indicator |
| One-time goal submit → manager approve | Employee goal sheet + manager review |
| Check-ins on locked goals only | `CheckinGate` on employee dashboard |
| Auto score by UoM | `src/lib/calculate-score.ts` |

### Manual edge-case checks

- Submit with 99% or 101% total → blocked with clear message
- 8 goals at 12.5% each → allowed
- Manager reject → employee rework → resubmit
- Goal-setting window closed → employee cannot edit (unless rework)

## Local development

```bash
pnpm install
pnpm dev
```

Environment variables (`.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Database setup

Run migrations in order (Supabase SQL Editor):

1. `supabase/migrations/202605160001_stage1_foundation.sql`
2. `supabase/migrations/202605160002_stage4_quarterly.sql`
3. `supabase/migrations/202605160003_goals_updated_at.sql`
4. `supabase/migrations/202605160004_goals_score_direction.sql`

Optional rich demo data (only if demo employee has no goals yet):

```bash
# Paste contents of supabase/seed/demo_seed.sql into SQL Editor
```

Set quarter window dates in **Admin → Quarter Windows** so today falls inside the window you want to demo.

## Verification

```bash
pnpm lint
pnpm test
pnpm build
```

## Documentation

Full implementation status, BRD workflow, and file index:

[docs/PROJECT_STATUS.md](./docs/PROJECT_STATUS.md)
