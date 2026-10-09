-- =====================================================================
-- OPTIONAL — NOT part of the sync script. Do not run this blind.
--
-- WHY: as of this audit the anon role has full SELECT + INSERT + UPDATE +
-- DELETE on pl_clients, pl_sales, pl_products and inventory, and the anon
-- key is served publicly in /profit-loss.html, /bl-tools.js, /protocol.html
-- and /mpauldino/. Anyone who views source can therefore read the whole
-- client roster and sales ledger, and can alter or delete rows.
--
-- THE CATCH: the P&L dashboard and the inventory tool use that same anon
-- key against those same tables. Revoking anon breaks them until they are
-- moved onto RPCs or a real login. Pick an option, then run only that part.
-- =====================================================================

-- ---------------------------------------------------------------------
-- OPTION A — stop the bleeding, keep the tools working (lowest risk)
-- Removes anon's ability to WRITE, leaves reads alone. The dashboard keeps
-- reading; anything that writes (recording a sale, decrementing inventory)
-- stops until Option C. The roster is still publicly readable.
-- ---------------------------------------------------------------------
-- revoke insert, update, delete on public.pl_clients  from anon;
-- revoke insert, update, delete on public.pl_sales    from anon;
-- revoke insert, update, delete on public.pl_products from anon;
-- revoke insert, update, delete on public.inventory   from anon;

-- ---------------------------------------------------------------------
-- OPTION B — also hide the two sensitive tables
-- Client names and the sales ledger stop being publicly readable. Keeps
-- pl_products and inventory readable so anything that only prices or
-- counts stock still works. BREAKS any dashboard view that lists clients
-- or sales.
-- ---------------------------------------------------------------------
-- revoke select on public.pl_clients from anon;
-- revoke select on public.pl_sales   from anon;

-- ---------------------------------------------------------------------
-- OPTION C — the real fix: anon touches no table at all
-- Everything the dashboard does goes through SECURITY DEFINER RPCs the
-- same way member_state does, or the dashboard moves behind a Supabase
-- login. This is a project, not a paste. Sketch only:
--
--   revoke all on public.pl_clients, public.pl_sales,
--                 public.pl_products, public.inventory from anon;
--   alter table public.pl_clients  enable row level security;
--   alter table public.pl_sales    enable row level security;
--   alter table public.pl_products enable row level security;
--   alter table public.inventory   enable row level security;
--   -- then one RPC per operation the dashboard actually performs,
--   -- each SECURITY DEFINER with search_path='' and granted to anon
--   -- only if it is genuinely safe to expose without a login.
--
-- Note that an RPC callable by anon with no secret is still callable by
-- anyone who reads the page source. If the dashboard is meant to be yours
-- alone, a login is the honest answer and RPCs only narrow the surface.
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- AUDIT — safe to run now, changes nothing. Shows where anon stands.
-- ---------------------------------------------------------------------
select table_name,
       string_agg(distinct privilege_type, ', ' order by privilege_type) as anon_privileges
  from information_schema.role_table_grants
 where grantee = 'anon'
   and table_schema = 'public'
 group by table_name
 order by table_name;

select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       (select count(*) from pg_policies p
         where p.schemaname = 'public' and p.tablename = c.relname) as policy_count
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r'
 order by 1;
