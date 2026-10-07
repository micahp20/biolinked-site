-- =============================================================================
-- BioLinked member state -- schedule + nutrition, per-member key, no login
-- Pilot: mpauldino only.  Paste this whole file into the Supabase SQL editor.
-- Touches NOTHING existing: new schema app_private, new functions in public.
-- Safe to re-run (idempotent).
-- =============================================================================

-- 1. ------------------------------------------------------------ no extension
-- Hashing uses pg_catalog.sha256(), core since PostgreSQL 11, rather than
-- pgcrypto's digest(). pgcrypto would have been a deployment hazard: if it is
-- already installed in some other schema, "create extension if not exists ...
-- with schema extensions" silently keeps the old location and extensions.digest
-- would not resolve, failing both functions at runtime rather than at install.

-- 2. ------------------------------------------------------------------ schema
-- The tables live OUTSIDE the public schema on purpose. PostgREST only exposes
-- schemas it is configured for (public by default), so the anon key cannot
-- address these tables at all -- not "is denied by policy", cannot name them.
-- RLS below is the second lock, for anything that bypasses that first one.
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

-- 3. ------------------------------------------------------------------ tables
create table if not exists app_private.member (
  slug        text primary key,
  key_hash    text not null,                  -- sha256 of the access key, never the key
  label       text,
  created_at  timestamptz not null default now()
);

create table if not exists app_private.member_state (
  slug        text not null references app_private.member(slug) on delete cascade,
  kind        text not null check (kind in ('schedule','nutrition')),
  payload     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (slug, kind)
);

-- The hard dose limit. This is the authority; the stepper in the page is only
-- a convenience rail. A compound with no row here cannot be saved at all.
create table if not exists app_private.dose_limit (
  slug        text not null references app_private.member(slug) on delete cascade,
  compound_id text not null,
  unit        text not null,
  min_dose    numeric not null,
  max_dose    numeric not null,
  primary key (slug, compound_id),
  constraint dose_limit_sane check (min_dose > 0 and min_dose <= max_dose)
);

alter table app_private.member       enable row level security;
alter table app_private.member_state enable row level security;
alter table app_private.dose_limit   enable row level security;
-- No policies are created: with RLS on and no policy, every non-owner role is
-- denied. The SECURITY DEFINER functions run as the owner and so pass through.
-- Do NOT use FORCE ROW LEVEL SECURITY here -- it would lock the functions out too.

revoke all on all tables in schema app_private from public, anon, authenticated;

-- 4. --------------------------------------------------------------- functions
-- search_path is pinned to '' and every name below is schema-qualified, so a
-- hostile object planted in a schema earlier on the path cannot be substituted
-- for one of ours. This is the standard SECURITY DEFINER hardening.

create or replace function public.get_member_state(p_slug text, p_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_state jsonb;
begin
  if not exists (
    select 1 from app_private.member m
     where m.slug = p_slug
       and m.key_hash = encode(pg_catalog.sha256(pg_catalog.convert_to(p_key, 'UTF8')), 'hex')
  ) then
    -- Identical error whether the slug is unknown or the key is wrong, so this
    -- cannot be used to discover which members exist.
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  select coalesce(jsonb_object_agg(s.kind, s.payload), '{}'::jsonb)
    into v_state
    from app_private.member_state s
   where s.slug = p_slug;

  return v_state;
end;
$$;

create or replace function public.save_member_state(
  p_slug text, p_key text, p_kind text, p_payload jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r        record;
  v_min    numeric;
  v_max    numeric;
  v_day    jsonb;
begin
  if not exists (
    select 1 from app_private.member m
     where m.slug = p_slug
       and m.key_hash = encode(pg_catalog.sha256(pg_catalog.convert_to(p_key, 'UTF8')), 'hex')
  ) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  if p_kind not in ('schedule','nutrition') then
    raise exception 'bad_kind' using errcode = '22023';
  end if;

  -- Stops the row being quietly repurposed as blob storage.
  if pg_column_size(p_payload) > 65536 then
    raise exception 'payload_too_large' using errcode = '22023';
  end if;

  if p_kind = 'schedule' then
    if jsonb_typeof(p_payload -> 'compounds') is distinct from 'array' then
      raise exception 'schedule_payload_needs_compounds_array' using errcode = '22023';
    end if;

    for r in
      select c ->> 'id'               as id,
             (c ->> 'dose')::numeric  as dose,
             c -> 'days'              as days
        from jsonb_array_elements(p_payload -> 'compounds') c
    loop
      if r.id is null then
        raise exception 'compound_missing_id' using errcode = '22023';
      end if;

      select d.min_dose, d.max_dose into v_min, v_max
        from app_private.dose_limit d
       where d.slug = p_slug and d.compound_id = r.id;

      -- Unknown compound is refused rather than ignored: otherwise a caller
      -- could add a compound of their own invention with any dose they liked.
      if not found then
        raise exception 'unknown_compound: %', r.id using errcode = '22023';
      end if;

      if r.dose is null or r.dose < v_min or r.dose > v_max then
        raise exception 'dose_out_of_range: % = % (allowed % to %)',
          r.id, coalesce(r.dose::text,'null'), v_min, v_max using errcode = '22023';
      end if;

      if jsonb_typeof(r.days) is distinct from 'array' then
        raise exception 'days_must_be_array: %', r.id using errcode = '22023';
      end if;
      -- Split in two: SQL OR is not guaranteed to short-circuit, so a
      -- non-numeric element must be rejected before anything casts it.
      for v_day in select * from jsonb_array_elements(r.days) loop
        if jsonb_typeof(v_day) <> 'number' then
          raise exception 'bad_day_index: % in %', v_day #>> '{}', r.id using errcode = '22023';
        end if;
        if (v_day #>> '{}')::numeric not in (0,1,2,3,4,5,6) then
          raise exception 'bad_day_index: % in %', v_day #>> '{}', r.id using errcode = '22023';
        end if;
      end loop;
    end loop;
  end if;

  insert into app_private.member_state (slug, kind, payload, updated_at)
  values (p_slug, p_kind, p_payload, now())
  on conflict (slug, kind)
    do update set payload = excluded.payload, updated_at = now();

  return jsonb_build_object('ok', true, 'kind', p_kind, 'updated_at', now());
end;
$$;

-- Both are left VOLATILE deliberately. PostgREST only allows GET on STABLE or
-- IMMUTABLE functions; VOLATILE forces POST, which keeps the access key in the
-- request body and out of URLs, proxy logs and browser history.

revoke all on function public.get_member_state(text, text)                from public;
revoke all on function public.save_member_state(text, text, text, jsonb)  from public;
grant execute on function public.get_member_state(text, text)               to anon;
grant execute on function public.save_member_state(text, text, text, jsonb) to anon;

-- 5. ------------------------------------------------------------ seed: member
-- sha256 of the pilot access key. The key itself is not stored anywhere in the
-- database; if this table ever leaked, it would not yield a working key.
insert into app_private.member (slug, key_hash, label)
values ('mpauldino',
        '9d403f6238c9dc76b87b36ed5ca740d5fa0b441cdc755904d34f226dfca27496',
        'Micah (pilot)')
on conflict (slug) do update set key_hash = excluded.key_hash;

-- 6. ------------------------------------------------- seed: dose limits
-- *** THESE ARE PLACEHOLDERS AND NEED MICAH'S CONFIRMATION. ***
-- They are the prototype's client-side rails, promoted to a hard server limit.
-- Nothing here was taken from his protocol -- his page states a dose, not a
-- range. Once applied, a dose outside these bounds cannot be saved at all.
insert into app_private.dose_limit (slug, compound_id, unit, min_dose, max_dose) values
  ('mpauldino','trt'   ,'mg' ,   30,   70),
  ('mpauldino','tirz'  ,'mg' ,  0.5,  2.5),
  ('mpauldino','hgh'   ,'iu' ,    1,    3),
  ('mpauldino','bpc-o' ,'mcg',  250, 1000),
  ('mpauldino','dihexa','mg' ,    5,   20),
  ('mpauldino','hcg'   ,'iu' ,  250,  750),
  ('mpauldino','dsip'  ,'mg' , 0.25,  1.5),
  ('mpauldino','bpc-i' ,'mg' , 0.25,  1.5),
  ('mpauldino','kpv'   ,'mg' , 0.25,  1.5),
  ('mpauldino','ipa'   ,'mg' , 0.25,  1.5),
  ('mpauldino','mots'  ,'mg' ,  0.5,    4),
  ('mpauldino','amino' ,'mcg',  250, 1000),
  ('mpauldino','mt'    ,'mg' , 0.25,    1),
  ('mpauldino','reta'  ,'mg' ,  0.5,    4),
  ('mpauldino','vesu'  ,'mg' ,  0.5,    4),
  ('mpauldino','epi'   ,'mg' ,  2.5,   15),
  ('mpauldino','pine'  ,'mg' ,    1,    8)
on conflict (slug, compound_id)
  do update set unit = excluded.unit,
                min_dose = excluded.min_dose,
                max_dose = excluded.max_dose;

-- 7. --------------------------------------------------------------- verify
-- Expect: 1 member, 17 dose limits, 2 functions, 3 tables with RLS on and
-- zero policies, and no table privileges granted to anon.
select 'members'      as check, count(*)::text as value from app_private.member
union all select 'dose_limits', count(*)::text from app_private.dose_limit
union all select 'rls_enabled_tables',
  count(*)::text from pg_tables
  where schemaname = 'app_private' and rowsecurity
union all select 'policies_should_be_0',
  count(*)::text from pg_policies where schemaname = 'app_private'
union all select 'anon_table_grants_should_be_0',
  count(*)::text from information_schema.role_table_grants
  where table_schema = 'app_private' and grantee in ('anon','authenticated','public');
