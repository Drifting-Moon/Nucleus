-- ============================================
-- NUCLEUS - Stage 1 Database Foundation
-- ============================================

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  role text not null default 'employee' check (role in ('employee', 'manager', 'admin')),
  department text,
  manager_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users add column if not exists department text;
alter table public.users add column if not exists manager_id uuid references public.users(id) on delete set null;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  thrust_area text,
  title text not null,
  weightage integer not null check (weightage >= 10 and weightage <= 100),
  uom text not null check (uom in ('number', 'percentage', 'timeline', 'zero_based')),
  target numeric,
  is_locked boolean not null default false,
  is_shared boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'rejected', 'locked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals add column if not exists thrust_area text;

create table if not exists public.quarterly_updates (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  quarter text not null check (quarter in ('q1', 'q2', 'q3', 'annual')),
  achievement numeric,
  status text not null default 'not_started' check (status in ('not_started', 'on_track', 'completed')),
  manager_feedback text,
  updated_at timestamptz not null default now(),
  unique (goal_id, quarter)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  changed_by uuid references public.users(id) on delete set null,
  goal_id uuid references public.goals(id) on delete cascade,
  field_changed text not null,
  old_value text,
  new_value text,
  changed_at timestamptz not null default now()
);

create table if not exists public.quarter_windows (
  id uuid primary key default gen_random_uuid(),
  quarter_name text not null check (quarter_name in ('goal_setting', 'q1', 'q2', 'q3', 'annual')),
  start_date date not null,
  end_date date not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quarter_windows_valid_dates check (end_date >= start_date),
  constraint quarter_windows_unique_name unique (quarter_name)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.users.name, excluded.name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.goals enable row level security;
alter table public.quarterly_updates enable row level security;
alter table public.audit_logs enable row level security;
alter table public.quarter_windows enable row level security;

drop policy if exists "Authenticated users can read all users" on public.users;
create policy "Authenticated users can read all users"
  on public.users
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can update their own profile" on public.users;
create policy "Authenticated users can update their own profile"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Authenticated users can read goals" on public.goals;
create policy "Authenticated users can read goals"
  on public.goals
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert goals" on public.goals;
create policy "Authenticated users can insert goals"
  on public.goals
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update goals" on public.goals;
create policy "Authenticated users can update goals"
  on public.goals
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete goals" on public.goals;
create policy "Authenticated users can delete goals"
  on public.goals
  for delete
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read quarterly_updates" on public.quarterly_updates;
create policy "Authenticated users can read quarterly_updates"
  on public.quarterly_updates
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert quarterly_updates" on public.quarterly_updates;
create policy "Authenticated users can insert quarterly_updates"
  on public.quarterly_updates
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update quarterly_updates" on public.quarterly_updates;
create policy "Authenticated users can update quarterly_updates"
  on public.quarterly_updates
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can read audit_logs" on public.audit_logs;
create policy "Authenticated users can read audit_logs"
  on public.audit_logs
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert audit_logs" on public.audit_logs;
create policy "Authenticated users can insert audit_logs"
  on public.audit_logs
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can read quarter_windows" on public.quarter_windows;
create policy "Authenticated users can read quarter_windows"
  on public.quarter_windows
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can manage quarter_windows" on public.quarter_windows;
create policy "Authenticated users can manage quarter_windows"
  on public.quarter_windows
  for all
  to authenticated
  using (true)
  with check (true);

update public.users
set role = 'employee',
    name = 'Test Employee',
    department = 'Engineering'
where email = 'employee@test.com';

update public.users
set role = 'manager',
    name = 'Test Manager',
    department = 'Engineering'
where email = 'manager@test.com';

update public.users
set role = 'admin',
    name = 'Test Admin',
    department = 'HR'
where email = 'admin@test.com';

update public.users
set manager_id = (
  select id from public.users where email = 'manager@test.com'
)
where email = 'employee@test.com';
