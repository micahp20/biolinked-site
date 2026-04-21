-- ═══════════════════════════════════════════════════════════════════
-- Bio Linked — Auto-Sync + Customer/Vendor Tracking
-- Run once in Supabase → SQL Editor. Safe to re-run (idempotent).
-- ═══════════════════════════════════════════════════════════════════

-- 1) Customer on sales, Vendor on orders
ALTER TABLE pl_sales  ADD COLUMN IF NOT EXISTS customer text;
ALTER TABLE pl_orders ADD COLUMN IF NOT EXISTS vendor   text;

-- 2) Link each product to an inventory item (for auto-sync of stock)
--    Auto-detects inventory.id type (bigint vs uuid) so the FK matches.
DO $mig$
DECLARE
  inv_id_type text;
BEGIN
  SELECT format_type(atttypid, atttypmod) INTO inv_id_type
  FROM pg_attribute WHERE attrelid = 'inventory'::regclass AND attname = 'id';

  EXECUTE format(
    'ALTER TABLE pl_products ADD COLUMN IF NOT EXISTS inventory_id %s REFERENCES inventory(id) ON DELETE SET NULL',
    inv_id_type
  );
END $mig$;

-- 3) Best-effort auto-link existing products to inventory by matching name
UPDATE pl_products p
SET inventory_id = i.id
FROM inventory i
WHERE p.inventory_id IS NULL
  AND LOWER(TRIM(p.name)) = LOWER(TRIM(i.name));

-- Verify:
--   SELECT p.name AS product, i.name AS linked_inventory
--   FROM pl_products p LEFT JOIN inventory i ON i.id = p.inventory_id
--   ORDER BY p.name;
