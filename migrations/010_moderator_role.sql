-- Migration 010: Add moderator role
-- Run this in the Cloudflare D1 console (same place you ran the other migrations)

ALTER TABLE users ADD COLUMN is_moderator INTEGER DEFAULT 0;
