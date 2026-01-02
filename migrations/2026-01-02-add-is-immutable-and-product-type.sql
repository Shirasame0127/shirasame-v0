-- Migration: add is_immutable column to tag_groups and ensure product-type group
BEGIN;

-- 1) Add column if not exists
ALTER TABLE IF EXISTS tag_groups
  ADD COLUMN IF NOT EXISTS is_immutable boolean NOT NULL DEFAULT false;

-- 2) Ensure special immutable group 'product-type' exists for each user that needs it.
-- NOTE: This inserts a row for any user that already has data in tag_groups; adjust as necessary for your environment.
-- Ensure there is a unique constraint so ON CONFLICT works
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'tag_groups_user_name_idx'
  ) THEN
    -- CONCURRENTLY cannot run inside a transaction block; create index normally
    CREATE UNIQUE INDEX IF NOT EXISTS tag_groups_user_name_idx ON tag_groups (user_id, name);
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- table doesn't exist yet; ignore
  NULL;
END$$;

INSERT INTO tag_groups (name, label, user_id, is_immutable)
SELECT 'product-type', 'Product Type', user_id, true
FROM (
  SELECT DISTINCT user_id FROM tag_groups
) u
ON CONFLICT (user_id, name) DO NOTHING;

COMMIT;
