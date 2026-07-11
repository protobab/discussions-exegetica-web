-- Add zoom_link to armchair_sessions
-- Paste this as a single chunk in the Cloudflare D1 console

ALTER TABLE armchair_sessions ADD COLUMN zoom_link TEXT DEFAULT '';
