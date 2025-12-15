-- Add an "order" column to collections to support manual ordering
BEGIN;

-- Add column if missing
ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS "order" integer;

-- Backfill values: assign sequential order based on created_at (newer -> lower index)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 AS rn
  FROM collections
)
UPDATE collections
SET "order" = ranked.rn
FROM ranked
WHERE collections.id = ranked.id;

-- Index to speed up ordering queries
CREATE INDEX IF NOT EXISTS idx_collections_order ON collections("order");

COMMIT;
