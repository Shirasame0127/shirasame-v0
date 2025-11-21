-- Create product/collection/recipe tables expected by mock data
-- Run this in Supabase SQL editor (Dashboard → SQL) or via psql

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  user_id text,
  title text,
  slug text UNIQUE,
  short_description text,
  body text,
  tags text[],
  price numeric,
  published boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS product_images (
  id text PRIMARY KEY,
  product_id text REFERENCES products(id) ON DELETE CASCADE,
  url text,
  width int,
  height int,
  aspect text,
  role text
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text REFERENCES products(id) ON DELETE CASCADE,
  provider text,
  url text,
  label text
);

CREATE TABLE IF NOT EXISTS collections (
  id text PRIMARY KEY,
  user_id text,
  title text,
  slug text UNIQUE,
  visibility text,
  description text,
  product_ids text[],
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS collection_items (
  id text PRIMARY KEY,
  collection_id text REFERENCES collections(id) ON DELETE CASCADE,
  product_id text,
  "order" int,
  created_at timestamptz
);

CREATE TABLE IF NOT EXISTS recipes (
  id text PRIMARY KEY,
  user_id text,
  title text,
  base_image_id text,
  image_data_url text,
  image_width int,
  image_height int,
  aspect_ratio text,
  pins jsonb,
  published boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE IF NOT EXISTS recipe_items (
  id text PRIMARY KEY,
  recipe_id text REFERENCES recipes(id) ON DELETE CASCADE,
  linked_product_id text,
  pin_x_pct numeric,
  pin_y_pct numeric,
  text_x_pct numeric,
  text_y_pct numeric,
  style jsonb
);

CREATE TABLE IF NOT EXISTS recipe_images (
  id text PRIMARY KEY,
  recipe_id text REFERENCES recipes(id) ON DELETE CASCADE,
  url text,
  width int,
  height int
);

CREATE TABLE IF NOT EXISTS custom_fonts (
  id text PRIMARY KEY,
  name text,
  url text,
  added_at timestamptz
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
