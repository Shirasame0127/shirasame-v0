-- Migrate data from `profiles` table into `users` and drop `profiles`
-- This script is safe to run: if `profiles` does not exist it will noop.
-- Run this in Supabase SQL editor. Review before executing.

DO $$
BEGIN
  -- If profiles table doesn't exist, skip migration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    RAISE NOTICE 'profiles table not found - skipping migration';
    RETURN;
  END IF;

  -- Ensure target columns exist (be permissive)
  EXECUTE 'ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS display_name text';
  EXECUTE 'ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS bio text';
  EXECUTE 'ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS profile_image_key text';
  EXECUTE 'ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS header_image_keys jsonb';

  -- For each profile row, update the corresponding users row
  EXECUTE '
    UPDATE public.users u
    SET
      display_name = COALESCE(u.display_name, p.display_name),
      bio = COALESCE(u.bio, p.bio),
      profile_image_key = COALESCE(u.profile_image_key, p.profile_image_url),
      header_image_keys = COALESCE(u.header_image_keys, p.header_image_urls)
    FROM public.profiles p
    WHERE p.user_id IS NOT NULL AND u.id = p.user_id
  ';

  -- Insert users for orphan profiles (if any)
  EXECUTE '
    INSERT INTO public.users (id, display_name, bio, profile_image_key, header_image_keys, created_at, updated_at)
    SELECT p.user_id, p.display_name, p.bio, p.profile_image_url, p.header_image_urls, now(), now()
    FROM public.profiles p
    LEFT JOIN public.users u ON u.id = p.user_id
    WHERE p.user_id IS NOT NULL AND u.id IS NULL
  ';

  -- After migration, drop profiles table
  EXECUTE 'DROP TABLE IF EXISTS public.profiles';

  RAISE NOTICE 'profiles -> users migration completed';
END$$;

-- Note: this migration is destructive (drops `profiles`). Ensure you have a DB backup before running.
