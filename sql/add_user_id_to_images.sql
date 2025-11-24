-- Add nullable user_id column to images table to avoid schema-cache errors
-- Run in Supabase SQL editor or psql as appropriate

ALTER TABLE IF EXISTS public.images
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Optionally add FK constraint afterwards if desired (ensure users.id exists and values match):
-- ALTER TABLE public.images
--   ADD CONSTRAINT images_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
