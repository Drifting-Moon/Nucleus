-- Add updated_at to goals if missing (older DBs created before this column existed)

alter table public.goals
  add column if not exists updated_at timestamptz default now();

update public.goals
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.goals
  alter column updated_at set default now();

create or replace function public.set_goals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_goals_updated_at();
