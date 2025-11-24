-- Ensure tags and tag_groups tables exist with expected columns
-- Run this in Supabase SQL editor (Dashboard → SQL) or via psql

-- Create tag_groups table if missing
CREATE TABLE IF NOT EXISTS tag_groups (
  name text PRIMARY KEY,
  label text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create tags table if missing
CREATE TABLE IF NOT EXISTS tags (
  id text PRIMARY KEY,
  name text NOT NULL,
  "group" text,
  link_url text,
  link_label text,
  user_id text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns if table exists but column absent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tags' AND column_name='sort_order') THEN
    ALTER TABLE tags ADD COLUMN sort_order int DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tag_groups' AND column_name='sort_order') THEN
    ALTER TABLE tag_groups ADD COLUMN sort_order int DEFAULT 0;
  END IF;
END$$;

-- Helpful index for ordering
CREATE INDEX IF NOT EXISTS idx_tags_sort_order ON tags(sort_order);
CREATE INDEX IF NOT EXISTS idx_tag_groups_sort_order ON tag_groups(sort_order);

