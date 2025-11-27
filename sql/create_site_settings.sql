-- Create a simple key/value table for site-wide settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default (empty) loading animation entry if not exists
INSERT INTO site_settings (key, value)
SELECT 'loading_animation'::text, jsonb_build_object('url', NULL)
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'loading_animation');
