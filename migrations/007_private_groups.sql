-- CHUNK 1: Add private flag to study_groups
ALTER TABLE study_groups ADD COLUMN is_private INTEGER DEFAULT 0;
ALTER TABLE study_groups ADD COLUMN invite_code TEXT DEFAULT '';

-- CHUNK 2: Index for invite code lookups
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON study_groups(invite_code);
