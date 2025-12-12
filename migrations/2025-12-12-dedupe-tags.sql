-- Dedupe script for tags table (use carefully on staging/backup first)

-- Example: remove duplicate tags keeping the lowest id
BEGIN;
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, group_id, name ORDER BY id) AS rn
  FROM tags
)
DELETE FROM tags WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
COMMIT;
