-- Supabase initial schema for images and profiles
-- Run this in Supabase SQL editor or via psql

-- Enable extension if needed
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- images table: stores Cloudflare Images metadata
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cf_id text,
  url text,
  filename text,
  metadata jsonb,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
-- Note: profile-like fields are stored on `users` table in this project.
