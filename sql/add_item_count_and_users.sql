-- Add collections.item_count column and a basic users table
-- Run this on your Supabase project (SQL editor or psql). Do NOT run from this repo.

-- Ensure pgcrypto for gen_random_uuid is available (Supabase allows this)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add item_count to collections if missing
ALTER TABLE IF EXISTS public.collections
  ADD COLUMN IF NOT EXISTS item_count integer DEFAULT 0;

-- Create a basic users table to back admin settings (non-destructive if exists)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text,
  bio text,
  email text,
  profile_image_key text,
  avatar_url text,
  background_type text,
  background_value text,
  background_image_key text,
  social_links jsonb,
  header_image_keys jsonb,
  amazon_access_key text,
  amazon_secret_key text,
  amazon_associate_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Optional: index on email for lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
