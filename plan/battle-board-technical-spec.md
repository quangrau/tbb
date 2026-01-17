# The Battle Board - Technical Specification

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│   Browser (Mobile/Tablet/Desktop)                           │
│   React + Vite + TailwindCSS                                │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS / WebSocket
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Auth      │  │  Database   │  │  Realtime           │  │
│  │  (future)   │  │  (Postgres) │  │  (WebSocket)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 18 + Vite | Fast dev, small bundle, familiar ecosystem |
| Styling | TailwindCSS | Rapid UI development, mobile-first |
| State | Zustand | Lightweight, simple for real-time state |
| Backend | Supabase | All-in-one: DB, real-time, auth (future), free tier |
| Database | PostgreSQL (via Supabase) | Relational, scalable, robust |
| Real-time | Supabase Realtime | Built-in WebSocket subscriptions |
| Hosting | Vercel | Zero-config React deployment, free tier |

---

## Client Local Storage Schema

Single source of truth for localStorage keys (avoid introducing duplicates).

| Key | Purpose | Written By | Cleared By |
|-----|---------|------------|------------|
| `tbb_device_id` | Anonymous identity for this browser/device | `getDeviceId()` | `clearDeviceId()` |
| `bb_active_room_id` | Last active room ID for refresh-resume | room store | room leave/reset, missing player in room |
| `bb_active_room_code` | Last active room code (restore/rejoin + join form autofill) | room store, join form submit | room leave/reset |
| `bb_last_nickname` | Last nickname used in create/join forms | create/join forms | (not cleared automatically) |

## Database Schema (Scalable Design)

### Design Principles
- **No hardcoded player slots** - Use separate `room_players` table instead of `player1_*`, `player2_*` columns
- **Flexible capacity** - Room can have 2 players today, 10 tomorrow
- **Audit trail** - Track all answers for analytics and review

### Tables

```sql
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
```

### Scalability Notes

| Current (MVP) | Future Ready |
|---------------|--------------|
| `max_players = 2` | Change to 10 for class challenges |
| `questions_count = 10` | Configurable per room |
| `time_per_question_sec = 10` | Configurable per room |
| `room_players` table | Supports unlimited players per room |

---

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css
│
├── config/
│   └── supabase.ts           # Supabase client init
│
├── types/
│   ├── database.ts           # Generated from Supabase
│   ├── room.ts
│   ├── player.ts
│   └── question.ts
│
├── stores/
│   ├── gameStore.ts          # Zustand store for game state
│   └── roomStore.ts          # Room and player state
│
├── services/
│   ├── roomService.ts        # Create, join, leave room
│   ├── gameService.ts        # Submit answer, get results
│   └── realtimeService.ts    # Supabase subscriptions
│
├── hooks/
│   ├── useRoom.ts
│   ├── useGame.ts
│   ├── useTimer.ts
│   └── useDeviceId.ts
│
├── pages/
│   ├── HomePage.tsx          # Create/Join buttons
│   ├── CreateRoomPage.tsx    # Grade/Term picker, show code
│   ├── JoinRoomPage.tsx      # Enter code + nickname
│   ├── WaitingRoomPage.tsx   # Player list, ready check
│   ├── ChallengePage.tsx     # Main gameplay
│   ├── ResultsPage.tsx       # Scores, rankings, winner
│   └── ReviewPage.tsx        # Wrong answer review
│
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Timer.tsx
│   │   └── Card.tsx
│   │
│   ├── QuestionCard.tsx
│   ├── OptionButton.tsx
│   ├── PlayerList.tsx
│   ├── ScoreBoard.tsx
│   └── RoomCodeDisplay.tsx
│
└── utils/
    ├── generateRoomCode.ts
    ├── deviceId.ts
    └── constants.ts
```

---

## Real-time Architecture

### Subscriptions

```typescript
// Subscribe to room changes (status, player list)
supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'rooms',
    filter: `id=eq.${roomId}`
  }, handleRoomChange)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'room_players',
    filter: `room_id=eq.${roomId}`
  }, handlePlayersChange)
  .subscribe()
```

### What Gets Synced in Real-time

| Event | Trigger | Subscribers See |
|-------|---------|-----------------|
| Player joins | INSERT room_players | Updated player list |
| Player ready | UPDATE room_players.is_ready | Ready status change |
| Game starts | UPDATE rooms.status = 'playing' | Navigate to challenge |
| Player progress | UPDATE room_players.current_question_index | "Opponent: 6/10" |
| Player finishes | UPDATE room_players.is_finished | Progress indicator |
| All finished | UPDATE rooms.status = 'finished' | Navigate to results |

---

## Implementation Phases

### Phase 1: Foundation
1. Create Vite + React + TailwindCSS project
2. Set up Supabase project and tables
3. Implement Supabase client and types
4. Build HomePage with Create/Join navigation
5. Device ID generation and storage

### Phase 2: Room System
1. CreateRoomPage: grade/term selection, code generation
2. Server function: pick random questions, create room
3. JoinRoomPage: code entry, nickname, join room
4. WaitingRoomPage: player list, ready toggle
5. Real-time subscription for player changes

### Phase 3: Challenge Core
1. ChallengePage: question display, options
2. 10-second countdown timer
3. Answer submission → record in answers table
4. Update player progress, score, total_time
5. Auto-advance on timeout
6. "Waiting for others" state when finished

### Phase 4: Results & Review
1. ResultsPage: fetch all players' scores/times
2. Determine winner (score, then time tiebreaker)
3. Display rankings (ready for N players)
4. ReviewPage: fetch player's wrong answers
5. Display question, their answer, correct answer, explanation

### Phase 5: Polish
1. Disconnect detection (heartbeat)
2. Auto-forfeit after 30s inactivity
3. Error handling and loading states
4. Mobile-responsive design testing
5. Basic animations (correct/wrong feedback)

---

## Key Technical Decisions

### Room Code Generation
```typescript
// 6 chars, no ambiguous characters (0/O, 1/I/L)
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  return Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
}
```

### Device ID (Anonymous Identity)
```typescript
// Generate once, store in localStorage
function getDeviceId(): string {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
}
```

### Timer Logic
```typescript
// Client-side timer, server records answer_time_ms
const [timeLeft, setTimeLeft] = useState(10);
const startTime = useRef(Date.now());

// On answer or timeout
const answerTimeMs = Date.now() - startTime.current;
await submitAnswer(questionId, selectedOption, answerTimeMs);
```

### Winner Determination (Scalable for N players)
```typescript
function determineRankings(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    // Higher score wins
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreaker: faster time wins
    return a.total_time_ms - b.total_time_ms;
  });
}
```

---

## Content Import

### CSV Format
```csv
grade,term,question_text,option_0,option_1,option_2,option_3,correct_index,explanation
3,1,"What is 24 + 18?",32,42,52,62,1,"Add ones: 4+8=12. Add tens: 20+10=30. Total: 30+12=42"
```

### Import Script (Python)
```python
# tools/import_questions.py
import csv
from supabase import create_client

def import_questions(csv_path: str):
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        questions = [{
            'grade': int(row['grade']),
            'term': int(row['term']),
            'question_text': row['question_text'],
            'options': [row['option_0'], row['option_1'], row['option_2'], row['option_3']],
            'correct_option_index': int(row['correct_index']),
            'explanation': row['explanation']
        } for row in reader]

    supabase.table('questions').insert(questions).execute()
```

---

## Verification Plan

### Manual Testing Checklist
- [ ] Create room, get code
- [ ] Join room with code on different device/browser
- [ ] Both players see each other in waiting room
- [ ] Ready toggle works, game starts when both ready
- [ ] Questions appear with 10s timer
- [ ] Answering advances to next question
- [ ] Timeout auto-advances with wrong answer
- [ ] "Waiting for opponent" shows when finished first
- [ ] Results show correct scores and times
- [ ] Review shows wrong answers with explanations
- [ ] Disconnect triggers forfeit after 30s

### Edge Cases
- [ ] Player lets all timers expire (0 points, 100s time)
- [ ] Same device joins twice (should block)
- [ ] Invalid room code
- [ ] Network disconnect mid-challenge
- [ ] Tie scenario: verify time tiebreaker works
- [ ] Room expires after 1 hour

---

## Environment Setup

```bash
# Create project
npm create vite@latest battle-board -- --template react-ts
cd battle-board

# Install dependencies
npm install @supabase/supabase-js zustand react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Environment variables (.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
