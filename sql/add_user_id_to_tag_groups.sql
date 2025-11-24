-- Migration: add user_id to tag_groups so tag groups can be owner-scoped
-- Run this in Supabase SQL editor or via psql against your DB.

ALTER TABLE tag_groups
  ADD COLUMN IF NOT EXISTS user_id text;

-- Optional: create index to speed lookups by owner
CREATE INDEX IF NOT EXISTS idx_tag_groups_user_id ON tag_groups(user_id);

-- NOTE: This migration only adds the column. You may want to backfill existing
-- rows to the configured owner. Example (replace <OWNER_USER_ID> with actual id):
-- UPDATE tag_groups SET user_id = '<OWNER_USER_ID>' WHERE user_id IS NULL;

-- Alternatively, to backfill using PUBLIC_PROFILE_EMAIL, you can run a two-step
-- process: 1) lookup user id from auth.users 2) update tag_groups. That requires
-- running queries in Supabase SQL editor with knowledge of your auth table.
