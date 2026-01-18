-- Add lobby feature columns to rooms table
ALTER TABLE rooms ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE rooms ADD COLUMN name VARCHAR(100);

-- Create partial index for efficient lobby queries
CREATE INDEX idx_rooms_lobby ON rooms(is_public, status, expires_at)
  WHERE is_public = TRUE AND status = 'waiting';
