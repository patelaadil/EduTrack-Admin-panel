-- Holidays table for EduTrack admin panel
-- Run this in Supabase SQL editor or via migration deploy.

create extension if not exists pgcrypto;

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  end_date date,
  reason text not null,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint holidays_date_range_check check (end_date is null or end_date >= date)
);

alter table if exists public.holidays
  drop constraint if exists holidays_date_key;

delete from public.holidays h
using public.holidays h2
where h.date = h2.date
  and (h.created_at, h.id) < (h2.created_at, h2.id);

alter table public.holidays
  add constraint holidays_date_key unique (date);

alter table if exists public.holidays
  add column if not exists end_date date;

update public.holidays
set end_date = date
where end_date is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'holidays_date_range_check'
  ) then
    alter table public.holidays
      add constraint holidays_date_range_check check (end_date is null or end_date >= date);
  end if;
end
$$;

create index if not exists holidays_date_idx on public.holidays (date);

alter table public.holidays enable row level security;

drop policy if exists "holidays_select_admin" on public.holidays;
create policy "holidays_select_admin"
on public.holidays
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "holidays_insert_admin" on public.holidays;
create policy "holidays_insert_admin"
on public.holidays
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "holidays_update_admin" on public.holidays;
create policy "holidays_update_admin"
on public.holidays
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "holidays_delete_admin" on public.holidays;
create policy "holidays_delete_admin"
on public.holidays
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create or replace function public.set_holidays_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_holidays_updated_at on public.holidays;
create trigger trg_holidays_updated_at
before update on public.holidays
for each row
execute function public.set_holidays_updated_at();
