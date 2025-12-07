-- Migration: Convert stored full-image URLs to R2 keys (key-only policy)
-- IMPORTANT: Run on a backup/staging first. This file contains multiple
-- UPDATE statements targeting common URL patterns observed in the project.
-- Adjust table/column names as necessary for your schema before running.

-- Make sure target columns exist (non-destructive)
BEGIN;

-- Add `key` columns if they don't exist yet. We use permissive IF NOT EXISTS.
ALTER TABLE IF EXISTS public.product_images ADD COLUMN IF NOT EXISTS key text;
ALTER TABLE IF EXISTS public.images ADD COLUMN IF NOT EXISTS key text;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS profile_image_key text;

-- 1) images.shirasame.com with /cdn-cgi/image/... pattern
-- Extract the path after the resizing prefix: /cdn-cgi/image/<opts>/<key>
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://images\.shirasame\.com/cdn-cgi/image/[^/]+/(.+)$', '\1')
WHERE url ~ '^https?://images\.shirasame\.com/cdn-cgi/image/' AND (key IS NULL OR key = '');

UPDATE public.images
SET key = REGEXP_REPLACE(url, '^https?://images\.shirasame\.com/cdn-cgi/image/[^/]+/(.+)$', '\1')
WHERE url ~ '^https?://images\.shirasame\.com/cdn-cgi/image/' AND (key IS NULL OR key = '');

-- 2) images.shirasame.com direct URLs: https://images.shirasame.com/<key>
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://images\.shirasame\.com/(.+)$', '\1')
WHERE url ~ '^https?://images\.shirasame\.com/' AND (key IS NULL OR key = '');

UPDATE public.images
SET key = REGEXP_REPLACE(url, '^https?://images\.shirasame\.com/(.+)$', '\1')
WHERE url ~ '^https?://images\.shirasame\.com/' AND (key IS NULL OR key = '');

-- 3) R2 published subdomain (r2.cloudflarestorage.com) or account-specific host
-- Example: https://<acct>.r2.cloudflarestorage.com/images/uploads/optimized/....
-- This removes the leading host/bucket prefix and extracts the path under the bucket.
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://[^/]+\.r2\.cloudflarestorage\.com/(?:[^/]+/)?(.+)$', '\1')
WHERE url ~ '^https?://[^/]+\.r2\.cloudflarestorage\.com/' AND (key IS NULL OR key = '');

UPDATE public.images
SET key = REGEXP_REPLACE(url, '^https?://[^/]+\.r2\.cloudflarestorage\.com/(?:[^/]+/)?(.+)$', '\1')
WHERE url ~ '^https?://[^/]+\.r2\.cloudflarestorage\.com/' AND (key IS NULL OR key = '');

-- 4) Common variant: URLs that contain /uploads/ or /images/ prefixes
-- Examples: https://.../uploads/<key>  or  https://.../images/<key>
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://[^/]+/(?:uploads|images)/(?:[^/]+/)?(.+)$', '\1')
WHERE url ~ '^https?://[^/]+/(?:uploads|images)/' AND (key IS NULL OR key = '');

UPDATE public.images
SET key = REGEXP_REPLACE(url, '^https?://[^/]+/(?:uploads|images)/(?:[^/]+/)?(.+)$', '\1')
WHERE url ~ '^https?://[^/]+/(?:uploads|images)/' AND (key IS NULL OR key = '');

-- 5) Generic fallback (use cautiously): strip host and optional first path segment
-- Only affect rows where key remains empty so we don't overwrite good values.
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://[^/]+/(?:[^/]+/)?(.+)$', '\1')
WHERE url ~ '^https?://[^/]+/' AND (key IS NULL OR key = '');

UPDATE public.images
SET key = REGEXP_REPLACE(url, '^https?://[^/]+/(?:[^/]+/)?(.+)$', '\1')
WHERE url ~ '^https?://[^/]+/' AND (key IS NULL OR key = '');

-- Update `profile_image_key` only from columns that actually exist to avoid
-- referencing missing columns (some datasets only have `profile_image`).
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'profile_image'
	) THEN
		EXECUTE $sql$
			UPDATE public.users
			SET profile_image_key = REGEXP_REPLACE(profile_image, '^https?://images\.shirasame\.com/(.+)$', '\1')
			WHERE (profile_image_key IS NULL OR profile_image_key = '')
				AND profile_image ~ '^https?://images\.shirasame\.com/';
		$sql$;
	END IF;

	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'profile_image_url'
	) THEN
		EXECUTE $sql$
			UPDATE public.users
			SET profile_image_key = REGEXP_REPLACE(profile_image_url, '^https?://images\.shirasame\.com/(.+)$', '\1')
			WHERE (profile_image_key IS NULL OR profile_image_key = '')
				AND profile_image_url ~ '^https?://images\.shirasame\.com/';
		$sql$;
	END IF;
END
$$;
 

-- Optional: if you want to nullify legacy url columns after validating, uncomment these
-- UPDATE public.product_images SET url = NULL WHERE key IS NOT NULL;
-- UPDATE public.images SET url = NULL WHERE key IS NOT NULL;
-- UPDATE public.users SET profile_image = NULL WHERE profile_image_key IS NOT NULL;

COMMIT;

-- Post-checks: list remaining rows that still have url but no key — inspect these patterns manually
-- SELECT id, url FROM public.product_images WHERE (key IS NULL OR key = '') AND url IS NOT NULL LIMIT 100;
-- SELECT id, url FROM public.images WHERE (key IS NULL OR key = '') AND url IS NOT NULL LIMIT 100;
