-- =====================================================================
-- BioLinked — slug-based cloud sync for schedule, nutrition and calculator state
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).
--
-- Model: no key, no login. A page knows its own slug and calls two RPCs.
-- anon gets EXECUTE on exactly those two functions and nothing else --
-- no direct table access, and no reach into any other table.
-- =====================================================================

begin;

-- ---------- 1. table -------------------------------------------------
create table if not exists public.member_state (
  slug        text        not null,
  kind        text        not null,
  payload     jsonb       not null default '{}'::jsonb,
  version     bigint      not null default 1,
  updated_at  timestamptz not null default now(),
  constraint member_state_pkey primary key (slug, kind),
  constraint member_state_kind_ck check (kind in ('schedule','nutrition','calculator')),
  constraint member_state_slug_ck check (slug ~ '^[a-z0-9][a-z0-9-]{1,39}$')
);

comment on table public.member_state is
  'Per-client UI state (schedule curation, nutrition plan, calculator inputs) keyed by page slug. Reached only through get_state/save_state.';

-- ---------- 2. lock the table down -----------------------------------
alter table public.member_state enable row level security;
alter table public.member_state force row level security;
-- No policies on purpose: with RLS on and no policy, every direct
-- anon/authenticated query returns nothing and writes nothing. The RPCs
-- below are SECURITY DEFINER and run as the owner, so they bypass this.

revoke all on table public.member_state from public;
revoke all on table public.member_state from anon;
revoke all on table public.member_state from authenticated;

-- ---------- 3. read every kind for one slug --------------------------
create or replace function public.get_state(p_slug text)
returns table (kind text, payload jsonb, version bigint, updated_at timestamptz)
language plpgsql
security definer
volatile                     -- keeps PostgREST on POST, never a cached GET
set search_path = ''
as $$
begin
  if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]{1,39}$' then
    raise exception 'bad slug' using errcode = 'PT400';
  end if;

  return query
    select s.kind, s.payload, s.version, s.updated_at
      from public.member_state s
     where s.slug = p_slug;
end;
$$;

-- ---------- 4. write one kind, with optimistic concurrency -----------
-- p_expected_version: 0 (or null) means "I believe nothing is stored yet".
-- A mismatch raises PT409 -> PostgREST returns HTTP 409 immediately.
-- Deliberately NOT 40001: that is serialization_failure, which poolers
-- and client libraries retry, which is how a conflict turns into a hang.
create or replace function public.save_state(
  p_slug             text,
  p_kind             text,
  p_payload          jsonb,
  p_expected_version bigint default 0
)
returns bigint
language plpgsql
security definer
volatile
set search_path = ''
as $$
declare
  v_current bigint;
  v_new     bigint;
begin
  if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]{1,39}$' then
    raise exception 'bad slug' using errcode = 'PT400';
  end if;
  if p_kind not in ('schedule','nutrition','calculator') then
    raise exception 'bad kind' using errcode = 'PT400';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload must be a json object' using errcode = 'PT400';
  end if;
  -- these are UI preferences, not documents; cap them so the endpoint
  -- cannot be used as free storage
  if pg_column_size(p_payload) > 65536 then
    raise exception 'payload too large' using errcode = 'PT413';
  end if;

  select s.version into v_current
    from public.member_state s
   where s.slug = p_slug and s.kind = p_kind
     for update;

  if v_current is null then
    if coalesce(p_expected_version, 0) <> 0 then
      raise exception 'version conflict: no stored row, client expected %',
        p_expected_version using errcode = 'PT409';
    end if;
    insert into public.member_state (slug, kind, payload, version, updated_at)
    values (p_slug, p_kind, p_payload, 1, now())
    returning version into v_new;
    return v_new;
  end if;

  if coalesce(p_expected_version, 0) <> v_current then
    raise exception 'version conflict: stored %, client expected %',
      v_current, p_expected_version using errcode = 'PT409';
  end if;

  update public.member_state s
     set payload    = p_payload,
         version    = s.version + 1,
         updated_at = now()
   where s.slug = p_slug and s.kind = p_kind
  returning s.version into v_new;

  return v_new;
end;
$$;

-- ---------- 5. grants: these two functions and nothing else ----------
revoke all on function public.get_state(text)                         from public;
revoke all on function public.save_state(text, text, jsonb, bigint)   from public;

grant execute on function public.get_state(text)                       to anon;
grant execute on function public.save_state(text, text, jsonb, bigint) to anon;

commit;

-- =====================================================================
-- VERIFICATION — run after the script above
-- =====================================================================

-- 5a. the two RPCs exist, are SECURITY DEFINER, VOLATILE, search_path=''
select p.proname,
       p.prosecdef                             as security_definer,
       case p.provolatile when 'v' then 'volatile'
                          when 's' then 'stable'
                          else 'immutable' end as volatility,
       p.proconfig                             as settings
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('get_state','save_state');
-- expect: prosecdef = true, volatility = volatile, settings = {search_path=}

-- 5b. RLS is on and there are no policies
select c.relname, c.relrowsecurity, c.relforcerowsecurity,
       (select count(*) from pg_policies pol
         where pol.schemaname='public' and pol.tablename='member_state') as policies
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relname='member_state';
-- expect: relrowsecurity = true, policies = 0

-- 5c. anon has NO privilege on the table itself
select coalesce(string_agg(privilege_type, ', '), '(none — correct)') as anon_table_privs
  from information_schema.role_table_grants
 where grantee='anon' and table_schema='public' and table_name='member_state';
-- expect: (none — correct)

-- 5d. every function anon may execute in public — should be only these two
select p.proname
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public'
   and has_function_privilege('anon', p.oid, 'EXECUTE')
 order by 1;
-- expect: get_state, save_state (plus any pre-existing ones you intend)

-- 5e. end-to-end round trip
select public.save_state('verify-slug','schedule','{"on":{"demo":1}}'::jsonb, 0) as v1;
select * from public.get_state('verify-slug');
-- a stale write must come back as PT409, not hang:
-- select public.save_state('verify-slug','schedule','{}'::jsonb, 0);
delete from public.member_state where slug='verify-slug';
