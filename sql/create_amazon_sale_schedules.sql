-- Create amazon_sale_schedules table used by the app
-- Run this in Supabase SQL editor or via `supabase db query < .\sql\create_amazon_sale_schedules.sql`

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.amazon_sale_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  sale_name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  collection_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_amazon_sale_schedules_collection_id ON public.amazon_sale_schedules(collection_id);
CREATE INDEX IF NOT EXISTS idx_amazon_sale_schedules_start_date ON public.amazon_sale_schedules(start_date);
