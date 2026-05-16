-- Stage 4: additive columns for quarterly check-ins
-- Safe to run on existing DBs. Does not rename or drop anything.

alter table public.quarterly_updates
  add column if not exists achievement_date date;

alter table public.quarterly_updates
  add column if not exists score numeric;

alter table public.quarterly_updates
  add column if not exists submitted_at timestamptz;

-- manager_feedback already exists for manager check-in comments
