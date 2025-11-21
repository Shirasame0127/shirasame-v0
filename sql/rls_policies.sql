-- Row Level Security (RLS) example policies for Supabase
-- Run this after creating tables in the SQL editor

-- Enable RLS on tables that should be access-controlled
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

-- profiles: allow users to select their own profile and admins to select all
CREATE POLICY IF NOT EXISTS "profiles_select_own" ON profiles
  FOR SELECT USING ( auth.uid() IS NOT NULL AND user_id::text = auth.uid() );

CREATE POLICY IF NOT EXISTS "profiles_insert_signed_in" ON profiles
  FOR INSERT WITH CHECK ( auth.uid() IS NOT NULL AND user_id::text = auth.uid() );

-- images: allow owners to insert/select their own images
CREATE POLICY IF NOT EXISTS "images_select_owner" ON images
  FOR SELECT USING ( auth.uid() IS NOT NULL AND owner_user_id::text = auth.uid() );

CREATE POLICY IF NOT EXISTS "images_insert_owner" ON images
  FOR INSERT WITH CHECK ( auth.uid() IS NOT NULL AND owner_user_id::text = auth.uid() );

-- products: only allow owners to insert/update
CREATE POLICY IF NOT EXISTS "products_insert_owner" ON products
  FOR INSERT WITH CHECK ( auth.uid() IS NOT NULL AND user_id::text = auth.uid() );

CREATE POLICY IF NOT EXISTS "products_select_public_or_owner" ON products
  FOR SELECT USING ( published = true OR (auth.uid() IS NOT NULL AND user_id::text = auth.uid()) );

-- Note: adapt policies to your auth model. Test carefully with a secondary account.
