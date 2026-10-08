-- =============================================================================
-- Optimistic concurrency for member_state.
-- Paste this whole file into the Supabase SQL editor. Safe to re-run.
--
-- WHY: two tabs, or a phone resuming from background, could both write and the
-- last one won -- silently reverting the other's change. After this, a write
-- built from a stale read is REFUSED and the client re-syncs instead.
--
-- NOTE FOR MICAH: this REPLACES save_member_state. It keeps your version's
-- behaviour exactly -- auth, kind, payload size, days 0-6, NO dose caps and no
-- unknown-compound check -- and only adds the version test. If you changed
-- anything else in your copy, diff it before running.
-- =============================================================================

-- 1. ------------------------------------------------------- version column
-- An integer, not a timestamp: timestamptz loses precision on its way through
-- JSON and back, and a comparison that is wrong by a microsecond is worse than
-- no comparison at all.
alter table app_private.member_state
  add column if not exists version bigint not null default 0;

-- 2. ------------------------------------------------- read returns versions
-- New shape: {"state":{kind->payload}, "versions":{kind->version}}.
-- The client tolerates the old flat shape too, so the order you run this in
-- does not matter.
create or replace function public.get_member_state(p_slug text, p_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_state jsonb; v_vers jsonb;
begin
  if not exists (
    select 1 from app_private.member m
     where m.slug = p_slug
       and m.key_hash = encode(pg_catalog.sha256(pg_catalog.convert_to(p_key,'UTF8')),'hex')
  ) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  select coalesce(jsonb_object_agg(s.kind, s.payload), '{}'::jsonb),
         coalesce(jsonb_object_agg(s.kind, s.version), '{}'::jsonb)
    into v_state, v_vers
    from app_private.member_state s
   where s.slug = p_slug;

  return jsonb_build_object('state', v_state, 'versions', v_vers);
end;
$$;

-- 3. --------------------------------------------- write checks the version
-- The old 4-argument function has to go or PostgREST sees two overloads and
-- cannot choose. The new 5th argument defaults to null, so a caller that omits
-- it still works and simply gets the old unchecked behaviour.
drop function if exists public.save_member_state(text, text, text, jsonb);

create or replace function public.save_member_state(
  p_slug text,
  p_key text,
  p_kind text,
  p_payload jsonb,
  p_expected_version bigint default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r         record;
  v_day     jsonb;
  v_current bigint;
  v_new     bigint;
begin
  if not exists (
    select 1 from app_private.member m
     where m.slug = p_slug
       and m.key_hash = encode(pg_catalog.sha256(pg_catalog.convert_to(p_key,'UTF8')),'hex')
  ) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  if p_kind not in ('schedule','nutrition') then
    raise exception 'bad_kind' using errcode = '22023';
  end if;

  if pg_column_size(p_payload) > 65536 then
    raise exception 'payload_too_large' using errcode = '22023';
  end if;

  -- ---- the concurrency test -------------------------------------------
  -- Only when the caller tells us what it last saw. A null expectation is a
  -- caller that does not care, or a first write before any row exists.
  if p_expected_version is not null then
    select s.version into v_current
      from app_private.member_state s
     where s.slug = p_slug and s.kind = p_kind;

    if found and v_current is distinct from p_expected_version then
      -- 40001 is serialization_failure: the client should re-read and retry,
      -- which is exactly what we want it to do.
      raise exception 'version_conflict: have %, you sent %', v_current, p_expected_version
        using errcode = '40001';
    end if;
  end if;

  -- ---- days stay validated; dose is deliberately NOT range-checked -----
  if p_kind = 'schedule' then
    if jsonb_typeof(p_payload -> 'compounds') is distinct from 'array' then
      raise exception 'schedule_payload_needs_compounds_array' using errcode = '22023';
    end if;

    for r in
      select c ->> 'id' as id, c -> 'days' as days
        from jsonb_array_elements(p_payload -> 'compounds') c
    loop
      if r.id is null then
        raise exception 'compound_missing_id' using errcode = '22023';
      end if;
      if jsonb_typeof(r.days) is distinct from 'array' then
        raise exception 'days_must_be_array: %', r.id using errcode = '22023';
      end if;
      for v_day in select * from jsonb_array_elements(r.days) loop
        if jsonb_typeof(v_day) <> 'number' then
          raise exception 'bad_day_index' using errcode = '22023';
        end if;
        if (v_day #>> '{}')::numeric not in (0,1,2,3,4,5,6) then
          raise exception 'bad_day_index' using errcode = '22023';
        end if;
      end loop;
    end loop;
  end if;

  insert into app_private.member_state (slug, kind, payload, updated_at, version)
  values (p_slug, p_kind, p_payload, now(), 1)
  on conflict (slug, kind) do update
    set payload    = excluded.payload,
        updated_at = now(),
        version    = app_private.member_state.version + 1
  returning version into v_new;

  return jsonb_build_object('ok', true, 'kind', p_kind,
                            'version', v_new, 'updated_at', now());
end;
$$;

-- Both stay VOLATILE so PostgREST only allows POST, keeping the key out of URLs.
revoke all on function public.get_member_state(text, text)                       from public;
revoke all on function public.save_member_state(text, text, text, jsonb, bigint) from public;
grant execute on function public.get_member_state(text, text)                       to anon;
grant execute on function public.save_member_state(text, text, text, jsonb, bigint) to anon;

-- 4. -------------------------------------------------------------- verify
-- Expect: version column present, exactly ONE save_member_state overload,
-- and anon holding execute on both.
select 'version_column' as check,
       count(*)::text as value
  from information_schema.columns
 where table_schema='app_private' and table_name='member_state' and column_name='version'
union all
select 'save_overloads_should_be_1',
       count(*)::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname='save_member_state'
union all
select 'anon_execute_grants_should_be_2',
       count(*)::text from information_schema.role_routine_grants
 where specific_schema='public' and grantee='anon'
   and routine_name in ('get_member_state','save_member_state');
