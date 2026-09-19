-- Run once in the Supabase SQL editor (project bfjydzealeethhcpdfxl).
create table if not exists public.nutrition_profiles (
  id          bigint generated always as identity primary key,
  page_slug   text        not null unique,
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.nutrition_profiles enable row level security;

-- Scoped to this table only: anon may read and upsert nutrition profiles,
-- and nothing else. No delete grant, so a row cannot be wiped by a visitor.
create policy nutrition_profiles_anon_select on public.nutrition_profiles
  for select to anon using (true);
create policy nutrition_profiles_anon_insert on public.nutrition_profiles
  for insert to anon with check (true);
create policy nutrition_profiles_anon_update on public.nutrition_profiles
  for update to anon using (true) with check (true);

grant select, insert, update on public.nutrition_profiles to anon;
