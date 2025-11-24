CREATE TABLE IF NOT EXISTS public.product_drafts (
  user_id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
