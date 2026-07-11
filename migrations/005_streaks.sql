-- ============================================================
-- Discussions Exegetica — Streaks & Weekly Pulse
-- Paste each CHUNK separately in the Cloudflare D1 console
-- ============================================================

-- CHUNK 1: User activity streaks
ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_active_date TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN last_thread_id INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_bible_ref TEXT DEFAULT '';

-- CHUNK 2: Weekly pulse stats
CREATE TABLE IF NOT EXISTS weekly_pulse (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start   TEXT NOT NULL UNIQUE,
  new_members  INTEGER DEFAULT 0,
  new_threads  INTEGER DEFAULT 0,
  new_replies  INTEGER DEFAULT 0,
  top_thread_id   INTEGER,
  top_thread_title TEXT DEFAULT '',
  created_at   TEXT DEFAULT (datetime('now'))
);
