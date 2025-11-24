-- Creates table to store Amazon PA-API credentials (site-scoped)
CREATE TABLE IF NOT EXISTS public.amazon_credentials (
  id text PRIMARY KEY,
  access_key text NOT NULL,
  secret_key text NOT NULL,
  associate_id text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
