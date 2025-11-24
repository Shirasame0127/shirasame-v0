-- Recreate amazon_credentials table so settings UI can reliably read/write
-- Drops and creates the table with nullable columns, then inserts a default row
BEGIN;

DROP TABLE IF EXISTS public.amazon_credentials;

CREATE TABLE public.amazon_credentials (
  id text PRIMARY KEY,
  access_key text,
  secret_key text,
  associate_id text,
  updated_at timestamptz DEFAULT now()
);

-- Insert a default row so the UI can update without needing to INSERT
INSERT INTO public.amazon_credentials (id, access_key, secret_key, associate_id)
VALUES ('default', '', '', '')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Notes:
-- 1) This creates nullable columns so the client can do partial updates.
-- 2) After applying, restart your dev server and test the settings save flow.
