-- ============================================================
-- Discussions Exegetica — Complete Database Setup
-- Paste this entire file into Cloudflare D1 console
-- ============================================================

-- USERS
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
  created_at    TEXT DEFAULT (datetime('now'))
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  icon        TEXT DEFAULT '✦',
  description TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0
);

-- THREADS
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

-- REPLIES
CREATE TABLE IF NOT EXISTS replies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id   INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id   INTEGER NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  like_count  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- LIKES
CREATE TABLE IF NOT EXISTS thread_likes (
  user_id   INTEGER NOT NULL REFERENCES users(id),
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, thread_id)
);

-- DAILY WORD
CREATE TABLE IF NOT EXISTS daily_words (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_ref   TEXT NOT NULL,
  verse_text  TEXT NOT NULL,
  theme       TEXT DEFAULT '',
  posted_date TEXT NOT NULL UNIQUE
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_created  ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_thread   ON replies(thread_id);

-- ============================================================
-- SEED DATA
-- ============================================================

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
