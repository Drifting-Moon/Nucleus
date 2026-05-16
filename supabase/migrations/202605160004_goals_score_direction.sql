-- Score direction for achievement vs target (BRD: higher-is-better vs lower-is-better)
alter table public.goals
  add column if not exists score_direction text not null default 'higher'
  check (score_direction in ('higher', 'lower'));
