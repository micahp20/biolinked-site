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
-- B) dmaynes — Derek Maynes — the "ordered 4, only 2 pulled" correction
--
-- DELIBERATELY NOT WRITTEN AS RUNNABLE SQL.
--
-- Two of his lines are 4 vials and the data available did not say which
-- one is short, so guessing would risk pulling the wrong compound:
--
--   * Wolverine Blend 10 mg x 4 @ $40  — Paid Order #003, $160
--   * VIP 10 mg x 4 @ $45              — New Order, still DUE, $180
--
-- Wolverine Blend is the likelier of the two, being paid; a due order
-- would normally have pulled nothing at all rather than half. But that
-- is an inference, not his record.
--
-- Run B0 to see which of his rows is short, then uncomment the matching
-- block in B1 and fill in the two ids it prints.
-- ---------------------------------------------------------------------

-- B0. What has actually been pulled for Derek, next to the product and
--     the stock it draws from. Compare qty against the order quantity.
select s.id            as sale_id,
       s.date,
       s.qty           as pulled_qty,
       s.price,
       s.note,
       p.id            as product_id,
       p.name          as product,
       p.cost,
       i.id            as inventory_id,
       i.name          as inventory_item,
       i.vials         as stock_now
  from public.pl_sales s
  join public.pl_products p on p.id = s.product_id
  left join public.inventory i on i.id = p.inventory_id
 where s.note ilike '%maynes%'
    or s.customer ilike '%maynes%'
    or s.client_id in (select id from public.pl_clients where name ilike '%derek%maynes%')
 order by s.date, s.id;

-- B0b. The product and inventory ids for the two candidates, so the
--      block below can be filled in without guessing.
select p.id as product_id, p.name as product, p.cost,
       i.id as inventory_id, i.name as inventory_item, i.vials as stock_now
  from public.pl_products p
  left join public.inventory i on i.id = p.inventory_id
 where p.name ilike '%wolverine%'
    or p.name ilike '%vip%'
    or p.name ilike '%vasoactive%'
 order by p.name;

-- B1. The correction, once the compound is known. Replace <PRODUCT_ID>,
--     <INVENTORY_ID> and <UNIT_PRICE> with the values B0/B0b printed,
--     then uncomment. It adds the 2 missing vials and takes 2 off stock;
--     it does not touch the existing partial row.
--
-- with ins as (
--   insert into public.pl_sales (product_id, date, qty, price, note)
--   select <PRODUCT_ID>, date '2026-10-11', 2, <UNIT_PRICE>,
--          'Derek Maynes · inventory correction · 2 of 4 vials not pulled'
--    where not exists (select 1 from public.pl_sales
--                       where product_id = <PRODUCT_ID>
--                         and note like 'Derek Maynes · inventory correction%')
--   returning qty
-- )
-- update public.inventory i
--    set vials  = i.vials - (select qty from ins),
--        status = case when i.vials - (select qty from ins) = 0  then 'out'
--                      when i.vials - (select qty from ins) <= 3 then 'low'
--                      else 'in-stock' end
--  where i.id = <INVENTORY_ID>
--    and exists (select 1 from ins)
--    and i.vials >= (select qty from ins);


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
