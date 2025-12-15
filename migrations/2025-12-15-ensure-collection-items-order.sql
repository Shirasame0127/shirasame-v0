-- Ensure collection_items has an "order" column used for ordering items within a collection
BEGIN;

ALTER TABLE collection_items
  ADD COLUMN IF NOT EXISTS "order" integer;

-- If there is a created_at, backfill per collection by created_at asc (or assign sequential values)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY collection_id ORDER BY created_at ASC) - 1 AS rn
  FROM collection_items
)
UPDATE collection_items
SET "order" = ranked.rn
FROM ranked
WHERE collection_items.id = ranked.id
  AND collection_items."order" IS NULL;

CREATE INDEX IF NOT EXISTS idx_collection_items_collection_order ON collection_items(collection_id, "order");

COMMIT;
