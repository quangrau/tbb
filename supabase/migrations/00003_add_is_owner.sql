-- Add is_owner field to room_players table
ALTER TABLE room_players ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;

-- Set existing first players as owners (by joined_at)
UPDATE room_players rp
SET is_owner = TRUE
WHERE rp.id = (
  SELECT id FROM room_players
  WHERE room_id = rp.room_id
  ORDER BY joined_at ASC
  LIMIT 1
);
