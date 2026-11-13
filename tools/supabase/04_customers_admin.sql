-- 04 — Private Customers page (admin-customers.html). Applied 2026-11-13.
-- Additive only: new columns default to "no consent", nothing existing is
-- rewritten. Phone/email/consent columns become unreadable and unwritable for
-- the anon and authenticated roles; the Customers page reaches them only
-- through the SECURITY DEFINER RPCs below, which require a signed-in,
-- email-confirmed user whose email is on app_private.bl_admins.

alter table public.pl_clients
  add column if not exists sms_consent        boolean     not null default false,
  add column if not exists sms_consent_at     timestamptz,
  add column if not exists sms_consent_method text,
  add column if not exists sms_opted_out      boolean     not null default false,
  add column if not exists portal_slug        text;

create schema if not exists app_private;
create table if not exists app_private.bl_admins (
  email      text primary key,
  created_at timestamptz not null default now()
);
alter table app_private.bl_admins enable row level security;
revoke all on app_private.bl_admins from public, anon, authenticated;
insert into app_private.bl_admins(email) values
  ('micahpauldino@gmail.com'), ('biolinkedsolutions@gmail.com')
on conflict do nothing;

-- Column-level privileges: the P&L dashboard (anon key) keeps the columns it
-- needs; contact + consent columns are hidden from anon and authenticated.
revoke select, insert, update, truncate, references, trigger on public.pl_clients from anon, authenticated;
grant select (id, name, venmo_handle, notes, last_contacted_at, created_at, portal_slug)
  on public.pl_clients to anon, authenticated;
grant insert (id, name, venmo_handle, notes, last_contacted_at, created_at)
  on public.pl_clients to anon, authenticated;
grant update (name, venmo_handle, notes, last_contacted_at)
  on public.pl_clients to anon, authenticated;
-- delete stays as it was (the P&L merge flow deletes duplicate clients).

create or replace function app_private.bl_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
      from app_private.bl_admins a
      join auth.users u on lower(u.email) = lower(a.email)
     where u.id = auth.uid()
       and u.email_confirmed_at is not null
       and lower(coalesce(auth.jwt() ->> 'email', '')) = lower(a.email)
  );
$$;
revoke all on function app_private.bl_is_admin() from public, anon, authenticated;

create or replace function public.admin_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select app_private.bl_is_admin();
$$;

create or replace function public.admin_customers()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not app_private.bl_is_admin() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'id', c.id, 'name', c.name, 'phone', c.phone, 'email', c.email,
             'sms_consent', c.sms_consent, 'sms_consent_at', c.sms_consent_at,
             'sms_consent_method', c.sms_consent_method, 'sms_opted_out', c.sms_opted_out,
             'portal_slug', c.portal_slug, 'created_at', c.created_at,
             'orders', coalesce(s.n, 0), 'total_spent', coalesce(s.total, 0), 'last_order', s.last)
           order by lower(c.name))
      from public.pl_clients c
      left join lateral (
        select count(*) n, sum(coalesce(x.qty, 0) * coalesce(x.price, 0)) total, max(x.date) last
          from public.pl_sales x
         where x.client_id = c.id
            or (x.client_id is null and x.customer = c.name)
      ) s on true), '[]'::jsonb);
end; $$;

create or replace function public.admin_save_customer(
  p_id uuid, p_name text, p_phone text, p_email text, p_portal_slug text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_id uuid; v_phone text; v_email text; v_slug text; v_name text;
begin
  if not app_private.bl_is_admin() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  v_name  := nullif(btrim(coalesce(p_name, '')), '');
  v_phone := nullif(btrim(coalesce(p_phone, '')), '');
  v_email := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_slug  := nullif(lower(btrim(coalesce(p_portal_slug, ''))), '');
  if v_phone is not null and v_phone !~ '^\+1[2-9][0-9]{2}[2-9][0-9]{6}$' then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;
  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  if v_slug is not null and v_slug !~ '^[a-z0-9][a-z0-9-]*$' then
    raise exception 'invalid_slug' using errcode = '22023';
  end if;
  if p_id is null then
    if v_name is null then raise exception 'name_required' using errcode = '22023'; end if;
    insert into public.pl_clients(name, phone, email, portal_slug)
      values (v_name, v_phone, v_email, v_slug) returning id into v_id;
  else
    update public.pl_clients
       set name = coalesce(v_name, name), phone = v_phone, email = v_email, portal_slug = v_slug
     where id = p_id returning id into v_id;
    if v_id is null then raise exception 'not_found' using errcode = 'P0002'; end if;
  end if;
  return jsonb_build_object('id', v_id, 'phone', v_phone, 'email', v_email, 'portal_slug', v_slug);
end; $$;

create or replace function public.admin_set_sms_consent(p_id uuid, p_consent boolean)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare r public.pl_clients;
begin
  if not app_private.bl_is_admin() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  update public.pl_clients
     set sms_consent        = coalesce(p_consent, false),
         sms_consent_at     = case when p_consent then now() else null end,
         sms_consent_method = case when p_consent then 'verbal' else null end,
         sms_opted_out      = case when p_consent then false else sms_opted_out end
   where id = p_id returning * into r;
  if r.id is null then raise exception 'not_found' using errcode = 'P0002'; end if;
  return jsonb_build_object('id', r.id, 'sms_consent', r.sms_consent, 'sms_consent_at', r.sms_consent_at,
                            'sms_consent_method', r.sms_consent_method, 'sms_opted_out', r.sms_opted_out);
end; $$;

create or replace function public.admin_set_sms_opt_out(p_id uuid, p_opted_out boolean)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare r public.pl_clients;
begin
  if not app_private.bl_is_admin() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  update public.pl_clients
     set sms_opted_out = coalesce(p_opted_out, false),
         sms_consent   = case when p_opted_out then false else sms_consent end
   where id = p_id returning * into r;
  if r.id is null then raise exception 'not_found' using errcode = 'P0002'; end if;
  return jsonb_build_object('id', r.id, 'sms_consent', r.sms_consent, 'sms_opted_out', r.sms_opted_out);
end; $$;

revoke all on function public.admin_is_admin(), public.admin_customers(),
  public.admin_save_customer(uuid, text, text, text, text),
  public.admin_set_sms_consent(uuid, boolean), public.admin_set_sms_opt_out(uuid, boolean)
  from public, anon;
grant execute on function public.admin_is_admin(), public.admin_customers(),
  public.admin_save_customer(uuid, text, text, text, text),
  public.admin_set_sms_consent(uuid, boolean), public.admin_set_sms_opt_out(uuid, boolean)
  to authenticated;
