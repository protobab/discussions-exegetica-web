-- Add status column to users if not already present
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
