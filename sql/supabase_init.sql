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

-- profiles table: public profile data for site
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  bio text,
  profile_image_url text,
  header_image_urls jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
