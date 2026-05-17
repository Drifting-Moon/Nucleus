-- Stage 6: Anytime / Continuous Feedback Module
-- Additive only. Handles anytime notes dropped by managers to employees outside active windows.

create table if not exists public.anytime_feedback (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.users(id) on delete cascade,
  manager_id uuid not null references public.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade, -- optional, can be linked to a specific goal
  feedback_text text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.anytime_feedback enable row level security;

-- Policies
drop policy if exists "Authenticated users can read anytime_feedback" on public.anytime_feedback;
create policy "Authenticated users can read anytime_feedback"
  on public.anytime_feedback
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert anytime_feedback" on public.anytime_feedback;
create policy "Authenticated users can insert anytime_feedback"
  on public.anytime_feedback
  for insert
  to authenticated
  with check (true);
