-- =============================================================================
-- FIX for 02_concurrency.sql -- run this next. Small and self-contained.
--
-- MY MISTAKE: I raised the conflict with SQLSTATE 40001 (serialization_failure).
-- That class is the one the stack treats as TRANSIENT and retries, so a
-- permanent conflict turned into a retry loop and the request never came back
-- -- it died at the gateway with a 504 instead of rejecting instantly.
--
-- PostgREST maps a SQLSTATE of the form PTnnn straight to HTTP nnn, so PT409
-- returns a clean 409 Conflict with no retry. Nothing else about the function
-- changes: auth, kind, payload size, days 0-6, no dose caps, no
-- unknown-compound check, and the version test itself all stay as they are.
-- =============================================================================

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

  if p_expected_version is not null then
    select s.version into v_current
      from app_private.member_state s
     where s.slug = p_slug and s.kind = p_kind;

    if found and v_current is distinct from p_expected_version then
      -- PT409 -> HTTP 409 Conflict, returned immediately. Not 40001: that is
      -- "try again" and the caller must NOT try again, it must re-read first.
      raise exception 'version_conflict: have %, you sent %', v_current, p_expected_version
        using errcode = 'PT409';
    end if;
  end if;

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

revoke all on function public.save_member_state(text, text, text, jsonb, bigint) from public;
grant execute on function public.save_member_state(text, text, text, jsonb, bigint) to anon;

-- Verify: still exactly one overload, anon still holds execute.
select 'save_overloads_should_be_1' as check, count(*)::text as value
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = 'save_member_state'
union all
select 'anon_execute_grants_should_be_2', count(*)::text
  from information_schema.role_routine_grants
 where specific_schema = 'public' and grantee = 'anon'
   and routine_name in ('get_member_state','save_member_state');
