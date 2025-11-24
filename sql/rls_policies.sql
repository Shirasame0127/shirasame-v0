-- Row Level Security (RLS) example policies for Supabase
-- Run this after creating tables in the SQL editor

-- Enable RLS on tables that should be access-controlled
-- Note: legacy `profiles` table removed; profile-like data is stored on `users`.
ALTER TABLE IF EXISTS images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

-- For user-profile data stored in `users`, consider adding RLS policies there if using row-level access control.
-- Example (uncomment/adapt as needed):
-- ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY IF NOT EXISTS "users_select_own" ON users
--   FOR SELECT USING ( auth.uid() IS NOT NULL AND id::text = auth.uid() );
-- CREATE POLICY IF NOT EXISTS "users_update_own" ON users
--   FOR UPDATE USING ( auth.uid() IS NOT NULL AND id::text = auth.uid() ) WITH CHECK ( auth.uid() IS NOT NULL AND id::text = auth.uid() );

-- images: allow owners to insert/select their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'images' AND policyname = 'images_select_owner'
  ) THEN
    EXECUTE 'CREATE POLICY images_select_owner ON images
      FOR SELECT USING ( auth.uid() IS NOT NULL AND owner_user_id = auth.uid()::uuid )';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'images' AND policyname = 'images_insert_owner'
  ) THEN
    EXECUTE 'CREATE POLICY images_insert_owner ON images
      FOR INSERT WITH CHECK ( auth.uid() IS NOT NULL AND owner_user_id = auth.uid()::uuid )';
  END IF;
END$$;

-- products: only allow owners to insert/update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_insert_owner'
  ) THEN
    EXECUTE 'CREATE POLICY products_insert_owner ON products
      FOR INSERT WITH CHECK ( auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text )';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_select_public_or_owner'
  ) THEN
    EXECUTE 'CREATE POLICY products_select_public_or_owner ON products
      FOR SELECT USING ( published = true OR (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text) )';
  END IF;
END$$;

-- Note: adapt policies to your auth model. Test carefully with a secondary account.
