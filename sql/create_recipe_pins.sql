-- Create recipe_pins table used by the app
-- Run this in Supabase SQL editor (Dashboard → SQL) or via psql against your DB

CREATE TABLE IF NOT EXISTS recipe_pins (
  id text PRIMARY KEY,
  recipe_id text REFERENCES recipes(id) ON DELETE CASCADE,
  product_id text,
  user_id text,
  tag_display_text text,
  dot_x_percent numeric DEFAULT 0,
  dot_y_percent numeric DEFAULT 0,
  tag_x_percent numeric DEFAULT 0,
  tag_y_percent numeric DEFAULT 0,
  dot_size_percent numeric DEFAULT 0,
  tag_font_size_percent numeric DEFAULT 0,
  line_width_percent numeric DEFAULT 0,
  tag_padding_x_percent numeric DEFAULT 0,
  tag_padding_y_percent numeric DEFAULT 0,
  tag_border_radius_percent numeric DEFAULT 0,
  tag_border_width_percent numeric DEFAULT 0,
  dot_color text,
  dot_shape text,
  tag_text text,
  tag_font_family text,
  tag_font_weight text,
  tag_text_color text,
  tag_text_shadow text,
  tag_background_color text,
  tag_background_opacity numeric DEFAULT 1,
  tag_border_color text,
  tag_shadow text,
  line_type text,
  line_color text,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_recipe_pins_recipe_id ON recipe_pins(recipe_id);
