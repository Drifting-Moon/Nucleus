-- Stage 5: rule-based escalation module
-- Additive only. Existing dashboards continue to work if this is applied later.

create table if not exists public.escalation_rules (
  id uuid primary key default gen_random_uuid(),
  rule_type text not null unique check (
    rule_type in (
      'goal_submission_overdue',
      'manager_approval_overdue',
      'checkin_overdue'
    )
  ),
  label text not null,
  days_after integer not null default 1 check (days_after >= 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.escalation_logs (
  id uuid primary key default gen_random_uuid(),
  rule_type text not null,
  subject_user_id uuid references public.users(id) on delete cascade,
  manager_user_id uuid references public.users(id) on delete set null,
  quarter text check (quarter in ('goal_setting', 'q1', 'q2', 'q3', 'annual')),
  stage text not null default 'employee' check (stage in ('employee', 'manager', 'hr')),
  status text not null default 'open' check (status in ('open', 'monitoring', 'resolved')),
  message text not null,
  days_overdue integer not null default 0 check (days_overdue >= 0),
  triggered_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.escalation_rules enable row level security;
alter table public.escalation_logs enable row level security;

drop policy if exists "Authenticated users can read escalation_rules" on public.escalation_rules;
create policy "Authenticated users can read escalation_rules"
  on public.escalation_rules
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can manage escalation_rules" on public.escalation_rules;
create policy "Authenticated users can manage escalation_rules"
  on public.escalation_rules
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can read escalation_logs" on public.escalation_logs;
create policy "Authenticated users can read escalation_logs"
  on public.escalation_logs
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can manage escalation_logs" on public.escalation_logs;
create policy "Authenticated users can manage escalation_logs"
  on public.escalation_logs
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.escalation_rules (rule_type, label, days_after, enabled)
values
  ('goal_submission_overdue', 'Goal submission overdue', 3, true),
  ('manager_approval_overdue', 'Manager approval overdue', 2, true),
  ('checkin_overdue', 'Quarterly check-in overdue', 1, true)
on conflict (rule_type) do update
set label = excluded.label,
    days_after = excluded.days_after,
    enabled = excluded.enabled,
    updated_at = now();
