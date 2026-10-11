-- =====================================================================
-- BioLinked — pending inventory pulls, to run by hand
-- Run in the Supabase SQL editor. Safe to re-run: see "Idempotency".
--
-- Why this file exists: the automated write path could not be used for
-- these two, so the statements are written out instead of executed.
-- NOTHING HERE HAS BEEN RUN. Inventory still shows the vials on the shelf.
--
-- Idempotency: each pull inserts its sale only if a matching row is not
-- already present, and the stock decrement is gated on that insert having
-- actually happened. Running the file twice does not pull twice. The
-- decrement also refuses to take stock below zero.
--
-- Stock figures in the comments were read live on 2026-10-11, after
-- jcress's pull. If anything has moved since, the guards still hold:
-- a line whose stock is too low simply will not decrement, and the
-- verification block at the end will show it.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- A) gliuzzi — Germaine Liuzzi — Cycle 3 · Recovery & Healing — $245.00
--
-- This is the UPDATED cycle: BPC-157/TB-500 x4 was swapped for
-- Wolverine 2.0 x2 at the same $35/vial, so the cycle went $315 -> $245
-- and 11 vials -> 9. Her page already reads Paid; only this pull is
-- outstanding.
--
-- Prices below are the UNIT price she actually paid, which is the
-- convention the recent pl_sales rows use. (Her Sept rows store line
-- totals instead — a historical inconsistency, not corrected here.)
--
-- She has no existing Cycle 3 rows: her only prior sales are Cycle 1,
-- dated 2026-09-01. This is a first pull.
-- ---------------------------------------------------------------------

-- A1. KPV 10mg — product 63, inventory 108 — 4 vials @ $25 = $100
--     stock 15 -> 11
with ins as (
  insert into public.pl_sales (product_id, date, qty, price, note)
  select 63, date '2026-10-11', 4, 25,
         'Germaine Liuzzi · Cycle 3 · Recovery & Healing · paid in full'
   where not exists (select 1 from public.pl_sales
                      where product_id = 63
                        and note like 'Germaine Liuzzi · Cycle 3%')
  returning qty
)
update public.inventory i
   set vials  = i.vials - (select qty from ins),
       status = case when i.vials - (select qty from ins) = 0  then 'out'
                     when i.vials - (select qty from ins) <= 3 then 'low'
                     else 'in-stock' end
 where i.id = 108
   and exists (select 1 from ins)
   and i.vials >= (select qty from ins);

-- A2. Wolverine 2.0 20mg — product 81, inventory 126 — 2 vials @ $35 = $70
--     stock 5 -> 3   (this one lands on 'low'; it was 6 before jcress)
with ins as (
  insert into public.pl_sales (product_id, date, qty, price, note)
  select 81, date '2026-10-11', 2, 35,
         'Germaine Liuzzi · Cycle 3 · Recovery & Healing · paid in full'
   where not exists (select 1 from public.pl_sales
                      where product_id = 81
                        and note like 'Germaine Liuzzi · Cycle 3%')
  returning qty
)
update public.inventory i
   set vials  = i.vials - (select qty from ins),
       status = case when i.vials - (select qty from ins) = 0  then 'out'
                     when i.vials - (select qty from ins) <= 3 then 'low'
                     else 'in-stock' end
 where i.id = 126
   and exists (select 1 from ins)
   and i.vials >= (select qty from ins);

-- A3. Cartalax 20mg — product 29, inventory 52 — 2 vials @ $25 = $50
--     stock 20 -> 18
--     NOTE: Wolverine 2.0 already contains Cartalax. She keeps a standalone
--     Cartalax line as well, which was left as-is on purpose.
with ins as (
  insert into public.pl_sales (product_id, date, qty, price, note)
  select 29, date '2026-10-11', 2, 25,
         'Germaine Liuzzi · Cycle 3 · Recovery & Healing · paid in full'
   where not exists (select 1 from public.pl_sales
                      where product_id = 29
                        and note like 'Germaine Liuzzi · Cycle 3%')
  returning qty
)
update public.inventory i
   set vials  = i.vials - (select qty from ins),
       status = case when i.vials - (select qty from ins) = 0  then 'out'
                     when i.vials - (select qty from ins) <= 3 then 'low'
                     else 'in-stock' end
 where i.id = 52
   and exists (select 1 from ins)
   and i.vials >= (select qty from ins);

-- A4. GHK-Cu 50mg — product 25, inventory 6 — 1 vial @ $25 = $25
--     stock 15 -> 14
with ins as (
  insert into public.pl_sales (product_id, date, qty, price, note)
  select 25, date '2026-10-11', 1, 25,
         'Germaine Liuzzi · Cycle 3 · Recovery & Healing · paid in full'
   where not exists (select 1 from public.pl_sales
                      where product_id = 25
                        and note like 'Germaine Liuzzi · Cycle 3%')
  returning qty
)
update public.inventory i
   set vials  = i.vials - (select qty from ins),
       status = case when i.vials - (select qty from ins) = 0  then 'out'
                     when i.vials - (select qty from ins) <= 3 then 'low'
                     else 'in-stock' end
 where i.id = 6
   and exists (select 1 from ins)
   and i.vials >= (select qty from ins);

commit;


-- ---------------------------------------------------------------------
-- ---------------------------------------------------------------------
-- B) dmaynes — Derek Maynes — VIP correction (confirmed 2026-10-11)
--
-- Micah confirmed the short line is VIP, not Wolverine Blend: Derek was
-- given 4 vials of VIP but only 2 were ever pulled, so stock is
-- overstated by 2. This adds the missing 2 and takes them off the shelf.
-- Expected: Derek's pulled VIP qty 2 -> 4, VIP stock 8 -> 6.
--
-- >>> FLAG — worth reading before you run this:
--     Derek's VIP line is "New Order · VIP Cycled Course", 4 vials @ $45
--     = $180, and its status is DUE. It is a quote, and it is his only
--     unpaid line. Booking these 2 vials into pl_sales at $45 adds $90
--     of revenue against an order nobody has paid for, which cuts
--     against the usual rule that only paid cycles count. Two vials were
--     evidently already pulled the same way, so this at least stays
--     consistent with what is already recorded.
--     The stock decrement is right either way — the vials are gone. If
--     you would rather not book the revenue, see B2 for the stock-only
--     version and skip B1.
--
-- Ids are resolved by name rather than hardcoded, because the VIP
-- product and inventory ids were never read. The block refuses to act
-- unless exactly one product matches, so a name collision is a no-op
-- rather than a wrong pull. Run B0 first and eyeball what it matches.
-- ---------------------------------------------------------------------

-- B0. Confirm the match first. Expect ONE product row, stock_now = 8.
select p.id as product_id, p.name as product, p.cost,
       i.id as inventory_id, i.name as inventory_item,
       i.vials as stock_now, i.status
  from public.pl_products p
  left join public.inventory i on i.id = p.inventory_id
 where p.name ilike '%vip%'
    or p.name ilike '%vasoactive%'
 order by p.name;

-- B0b. What has already been pulled for Derek. Expect a VIP row of qty 2.
select s.id as sale_id, s.date, s.qty as pulled_qty, s.price, s.note,
       p.name as product
  from public.pl_sales s
  join public.pl_products p on p.id = s.product_id
 where s.note ilike '%maynes%'
 order by s.date, s.id;

-- B1. The correction: books the 2 missing vials AND takes them off stock.
--     Idempotent — the sale inserts only if the correction row is not
--     already there, and the decrement is gated on that insert, so
--     re-running does nothing. Will not take stock below zero, and does
--     nothing at all unless exactly one product matched above.
with vip as (
  select p.id as product_id, p.inventory_id
    from public.pl_products p
   where p.name ilike '%vip%'
      or p.name ilike '%vasoactive%'
),
one as (
  select product_id, inventory_id from vip
   where (select count(*) from vip) = 1
),
ins as (
  insert into public.pl_sales (product_id, date, qty, price, note)
  select o.product_id, date '2026-10-11', 2, 45,
         'Derek Maynes · inventory correction · 2 of 4 VIP vials not pulled'
    from one o
   where not exists (select 1 from public.pl_sales
                      where note like 'Derek Maynes · inventory correction%')
  returning qty
)
update public.inventory i
   set vials  = i.vials - 2,
       status = case when i.vials - 2 = 0  then 'out'
                     when i.vials - 2 <= 3 then 'low'
                     else 'in-stock' end
 where i.id in (select inventory_id from one)
   and exists (select 1 from ins)
   and i.vials >= 2;

-- B2. ALTERNATIVE — stock only, no revenue booked. Use this INSTEAD of
--     B1 if you do not want $90 on an unpaid quote. Not idempotent on
--     its own (it has no sale row to gate on), so run it exactly once.
--
-- update public.inventory i
--    set vials  = i.vials - 2,
--        status = case when i.vials - 2 = 0  then 'out'
--                      when i.vials - 2 <= 3 then 'low'
--                      else 'in-stock' end
--  where i.id = (select p.inventory_id from public.pl_products p
--                 where p.name ilike '%vip%' or p.name ilike '%vasoactive%')
--    and i.vials >= 2;


-- ---------------------------------------------------------------------
-- VERIFICATION — run after the file. Section A should show four rows
-- totalling $245.00 and the four stock levels below.
-- ---------------------------------------------------------------------

-- V1. The rows section A should have created.
select s.id, s.date, p.name as product, s.qty, s.price,
       (s.qty * s.price) as line_total, s.note
  from public.pl_sales s
  join public.pl_products p on p.id = s.product_id
 where s.note like 'Germaine Liuzzi · Cycle 3%'
 order by s.id;

-- V2. Does it add up to her cycle total?
--     expect: lines 4, vials 9, revenue 245.00
select count(*)            as lines,
       sum(s.qty)          as vials,
       sum(s.qty * s.price) as revenue
  from public.pl_sales s
 where s.note like 'Germaine Liuzzi · Cycle 3%';

-- V3. Stock after the pull.
--     expect: KPV 11, Wolverine 2.0 3 (low), Cartalax 18, GHK-Cu 14
select id, name, vials, status
  from public.inventory
 where id in (108, 126, 52, 6)
 order by name;

-- V4. Section B: Derek's VIP after the correction.
--     expect: two rows, pulled_qty 2 + 2 = 4 vials total
select s.id, s.date, s.qty, s.price, s.note
  from public.pl_sales s
  join public.pl_products p on p.id = s.product_id
 where s.note ilike '%maynes%'
   and (p.name ilike '%vip%' or p.name ilike '%vasoactive%')
 order by s.date, s.id;

-- V5. VIP stock after the correction.
--     expect: vials 6, status in-stock
select i.id, i.name, i.vials, i.status
  from public.inventory i
  join public.pl_products p on p.inventory_id = i.id
 where p.name ilike '%vip%' or p.name ilike '%vasoactive%';
