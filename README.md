# Nucleus

Nucleus is a role-based performance goals portal for employees, managers, and admins.

## Current Status

Stage 1 foundation is in place:

- Supabase Auth login
- Employee, Manager, and Admin role selection
- server-side dashboard role guards
- dashboard shells with logout
- Supabase migration for users, goals, quarterly updates, audit logs, and quarter windows

For the latest implementation notes and next steps, see:

[docs/PROJECT_STATUS.md](./docs/PROJECT_STATUS.md)

## Local Development

```bash
pnpm install
pnpm dev
```

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Verification

```bash
pnpm lint
pnpm build
```
