-- CHUNK 1: Add max_members and approval_required to study_groups
ALTER TABLE study_groups ADD COLUMN max_members INTEGER DEFAULT 0;
ALTER TABLE study_groups ADD COLUMN approval_required INTEGER DEFAULT 0;

-- CHUNK 2: Add join requests table
CREATE TABLE IF NOT EXISTS group_join_requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id   INTEGER NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  status     TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(group_id, user_id)
);
