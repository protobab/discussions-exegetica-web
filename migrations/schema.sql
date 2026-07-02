-- ============================================================
-- Discussions Exegetica v2 — Complete Database Schema
-- Run each CHUNK separately in the Cloudflare D1 console
-- ============================================================

-- CHUNK 1: Users & Categories
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  bio           TEXT DEFAULT '',
  avatar_color  TEXT DEFAULT '#1B2A4A',
  badge         TEXT DEFAULT 'Seeker',
  reputation    INTEGER DEFAULT 0,
  is_admin      INTEGER DEFAULT 0,
  email_replies INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  icon        TEXT DEFAULT '✦',
  description TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0
);

-- CHUNK 2: Threads & Replies
CREATE TABLE IF NOT EXISTS threads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  author_id   INTEGER NOT NULL REFERENCES users(id),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  is_pinned   INTEGER DEFAULT 0,
  view_count  INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS replies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id   INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id   INTEGER NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  like_count  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS thread_likes (
  user_id   INTEGER NOT NULL REFERENCES users(id),
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, thread_id)
);

-- CHUNK 3: Daily Word & Study Groups
CREATE TABLE IF NOT EXISTS daily_words (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_ref   TEXT NOT NULL,
  verse_text  TEXT NOT NULL,
  theme       TEXT DEFAULT '',
  posted_date TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  type       TEXT NOT NULL,
  thread_id  INTEGER,
  group_id   INTEGER,
  message    TEXT NOT NULL,
  is_read    INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_groups (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  description  TEXT DEFAULT '',
  book_focus   TEXT DEFAULT '',
  owner_id     INTEGER NOT NULL REFERENCES users(id),
  member_count INTEGER DEFAULT 1,
  post_count   INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_group_members (
  group_id  INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id   INTEGER NOT NULL REFERENCES users(id),
  role      TEXT DEFAULT 'member',
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS study_group_posts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id   INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  author_id  INTEGER NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- CHUNK 4: Armchair (Blog + Sessions + Streaming)
CREATE TABLE IF NOT EXISTS armchair_posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  excerpt     TEXT DEFAULT '',
  body        TEXT NOT NULL,
  cover_image TEXT DEFAULT '',
  author_id   INTEGER NOT NULL REFERENCES users(id),
  published   INTEGER DEFAULT 1,
  view_count  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS armchair_sessions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT NOT NULL,
  description     TEXT DEFAULT '',
  guest_name      TEXT DEFAULT '',
  guest_bio       TEXT DEFAULT '',
  cover_image     TEXT DEFAULT '',
  scheduled_at    TEXT NOT NULL,
  status          TEXT DEFAULT 'scheduled',
  room_id         TEXT NOT NULL UNIQUE,
  recording_key   TEXT DEFAULT '',
  recording_url   TEXT DEFAULT '',
  listener_count  INTEGER DEFAULT 0,
  host_id         INTEGER NOT NULL REFERENCES users(id),
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS armchair_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES armchair_sessions(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  is_question INTEGER DEFAULT 0,
  flag_count  INTEGER DEFAULT 0,
  is_hidden   INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS armchair_message_flags (
  message_id INTEGER NOT NULL REFERENCES armchair_messages(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (message_id, user_id)
);

-- CHUNK 5: Indexes + Seed Data
CREATE INDEX IF NOT EXISTS idx_threads_category  ON threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_created   ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_thread    ON replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_daily_words_date  ON daily_words(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status   ON armchair_sessions(status, scheduled_at);

INSERT OR IGNORE INTO categories (slug, label, icon, description, sort_order) VALUES
  ('exegesis',  'Deep Dive',       '📖', 'Verse-by-verse and word-by-word biblical study', 1),
  ('seekers',   'Seekers Corner',  '🌱', 'A safe space — no question is too basic here',  2),
  ('prayer',    'Prayer & Life',   '🙏', 'Faith in daily life, prayer, and Christian living', 3),
  ('prophecy',  'Prophecy',        '🕊️', 'Biblical prophecy, Messianic texts, fulfilment', 4),
  ('theology',  'Theology',        '⚡', 'Doctrine, systematic theology, and apologetics', 5),
  ('resources', 'Resources',       '📚', 'Commentaries, tools, sermons, and study aids',  6);

INSERT OR IGNORE INTO daily_words (verse_ref, verse_text, theme, posted_date) VALUES
  ('John 1:1',       'In the beginning was the Word, and the Word was with God, and the Word was God.',                                                'The Nature of Christ',      date('now')),
  ('Psalm 119:105',  'Your word is a lamp to my feet and a light to my path.',                                                                         'Scripture as Guide',        date('now','+1 day')),
  ('Hebrews 4:12',   'For the word of God is living and active, sharper than any two-edged sword.',                                                    'The Power of Scripture',    date('now','+2 days')),
  ('Romans 10:17',   'So faith comes from hearing, and hearing through the word of Christ.',                                                            'Faith and the Word',        date('now','+3 days')),
  ('Isaiah 40:8',    'The grass withers, the flower fades, but the word of our God will stand forever.',                                               'Eternal Truth',             date('now','+4 days')),
  ('2 Timothy 3:16', 'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness.','Inspiration of Scripture', date('now','+5 days')),
  ('Matthew 5:3',    'Blessed are the poor in spirit, for theirs is the kingdom of heaven.',                                                           'The Beatitudes',            date('now','+6 days'));
