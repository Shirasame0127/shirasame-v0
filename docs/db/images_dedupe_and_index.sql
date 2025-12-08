-- Backup first: pg_dump or Supabase snapshot before running this script.
-- This script performs duplicate detection, removes duplicate rows keeping the oldest by created_at,
-- and then creates a unique index on images.key concurrently.

-- 1) Detect duplicates
-- SELECT key, COUNT(*) as cnt FROM public.images GROUP BY key HAVING COUNT(*) > 1 ORDER BY cnt DESC;

-- 2) Remove duplicates while keeping the earliest created_at (keep rn = 1)
BEGIN;
WITH ranked AS (
  SELECT id, key, ROW_NUMBER() OVER (PARTITION BY key ORDER BY COALESCE(created_at, now()) ASC, id ASC) AS rn
  FROM public.images
)
DELETE FROM public.images WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
COMMIT;

-- 3) Create unique index on key concurrently (non-blocking)
-- Note: CREATE INDEX CONCURRENTLY cannot be run inside a transaction block.
-- Run the following as a separate command after dedupe completes.
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS images_key_unique ON public.images (key);

-- If your environment does not support CONCURRENTLY (or you prefer blocking), run:
-- CREATE UNIQUE INDEX IF NOT EXISTS images_key_unique ON public.images (key);

-- 4) Optional verification
-- SELECT key, COUNT(*) FROM public.images GROUP BY key HAVING COUNT(*) > 1;
-- 
-- End of script
