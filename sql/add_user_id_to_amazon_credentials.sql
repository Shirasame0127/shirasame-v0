-- Add user_id column to amazon_credentials and make it unique per user
ALTER TABLE IF EXISTS public.amazon_credentials
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Create a unique index so each user can have at most one credentials row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'amazon_credentials_user_id_key'
  ) THEN
    CREATE UNIQUE INDEX amazon_credentials_user_id_key ON public.amazon_credentials (user_id);
  END IF;
END$$;

-- Note: After running this, consider updating the existing default row to point to your owner user id:
-- UPDATE public.amazon_credentials SET user_id = '<OWNER_USER_UUID>' WHERE id = 'default';
