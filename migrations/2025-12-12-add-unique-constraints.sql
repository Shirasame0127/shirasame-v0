-- Migration: add unique constraints for tag_groups and tags
-- Run in staging first. This migration will fail if duplicates exist.

ALTER TABLE IF EXISTS tag_groups
  ADD CONSTRAINT IF NOT EXISTS uniq_user_name UNIQUE (user_id, name);

ALTER TABLE IF EXISTS tags
  ADD CONSTRAINT IF NOT EXISTS uniq_user_group_name UNIQUE (user_id, group_id, name);

-- Dedupe guidance (run before enabling constraints if duplicates exist):
-- 1) Find duplicates for tag_groups
-- SELECT user_id, name, array_agg(id) as ids, count(*) FROM tag_groups GROUP BY user_id, name HAVING count(*) > 1;
-- 2) Keep the smallest id per group and delete others (example):
-- WITH dup AS (
--   SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, name ORDER BY id) AS rn FROM tag_groups
-- ) DELETE FROM tag_groups WHERE id IN (SELECT id FROM dup WHERE rn > 1);
