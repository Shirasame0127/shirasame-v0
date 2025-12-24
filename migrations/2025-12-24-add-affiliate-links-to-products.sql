-- Migration: add affiliate_links column to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS affiliate_links jsonb NULL DEFAULT '[]'::jsonb;

-- Optional: create GIN index for searches on affiliate_links (if needed)
CREATE INDEX IF NOT EXISTS idx_products_affiliate_links ON public.products USING gin (affiliate_links jsonb_path_ops);
