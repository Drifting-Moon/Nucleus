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
pnpm build
```

## Documentation

Full implementation status, BRD workflow, and file index:

[docs/PROJECT_STATUS.md](./docs/PROJECT_STATUS.md)
