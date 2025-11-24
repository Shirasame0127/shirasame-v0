-- Add direct profile_image and header_image columns to users
-- Run this in Supabase SQL editor. Non-destructive if columns already exist.

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS profile_image text;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS header_image text;

-- Ensure header_image_keys exists as jsonb for backward compatibility
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS header_image_keys jsonb;

-- Optional: populate new columns from existing keys if possible
-- WARNING: the following is a best-effort and may need adjustment for your data model.
-- For users with header_image_keys array, set header_image to the first element if header_image is null.
UPDATE public.users
SET header_image = (CASE WHEN header_image IS NULL THEN (CASE WHEN jsonb_typeof(header_image_keys) = 'array' THEN (header_image_keys->>0) ELSE header_image END) ELSE header_image END)
WHERE header_image IS NULL AND header_image_keys IS NOT NULL;

-- For profile_image, if profile_image is null but profile_image_key contains a URL, copy it
UPDATE public.users
SET profile_image = profile_image_key
WHERE profile_image IS NULL AND profile_image_key IS NOT NULL;
