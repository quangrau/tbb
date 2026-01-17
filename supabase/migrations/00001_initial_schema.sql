-- ============================================
-- THE BATTLE BOARD - Initial Database Schema
-- ============================================

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 6),
  term INT NOT NULL CHECK (term BETWEEN 1 AND 4),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,  -- ["24", "32", "28", "36"]
  correct_option_index INT NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_grade_term ON questions(grade, term);

-- ============================================
-- ROOMS TABLE
-- ============================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  grade INT NOT NULL,
  term INT NOT NULL,

  -- Room configuration (scalable for future)
  max_players INT NOT NULL DEFAULT 2,
  questions_count INT NOT NULL DEFAULT 10,
  time_per_question_sec INT NOT NULL DEFAULT 10,

  -- Pre-selected questions for this room
  question_ids UUID[] NOT NULL,

  -- Room lifecycle
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    -- 'waiting' = accepting players
    -- 'ready' = all players joined, waiting to start
    -- 'playing' = challenge in progress
    -- 'finished' = challenge complete

  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);

-- ============================================
-- ROOM PLAYERS TABLE (Scalable - supports N players)
-- ============================================
CREATE TABLE room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,

  -- Player identity (anonymous for MVP)
  device_id VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,

  -- Player state
  is_ready BOOLEAN DEFAULT FALSE,
  is_finished BOOLEAN DEFAULT FALSE,

  -- Results (updated as player progresses)
  current_question_index INT DEFAULT 0,  -- 0-9 for 10 questions
  score INT DEFAULT 0,
  total_time_ms INT DEFAULT 0,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(room_id, device_id)
);

CREATE INDEX idx_room_players_room ON room_players(room_id);

-- ============================================
-- ANSWERS TABLE (For review & analytics)
-- ============================================
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES room_players(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),

  question_index INT NOT NULL,  -- 0-9, order in this challenge
  selected_option_index INT,    -- NULL if timeout
  is_correct BOOLEAN NOT NULL,
  answer_time_ms INT NOT NULL,  -- Time taken (10000 if timeout)

  answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_answers_player ON answers(player_id);
CREATE INDEX idx_answers_room ON answers(room_id);

-- ============================================
-- Enable Realtime for relevant tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
