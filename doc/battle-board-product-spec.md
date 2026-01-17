# The Battle Board - Product Specification

## Vision
The most engaging, high-quality multiplayer learning experience for primary school students, combining Singapore Math rigor with competitive gameplay.

---

## Core Concept: Speed Challenge

A real-time multiplayer quiz where players race to answer questions correctly. Each player competes independently on their own device, with results compared at the end.

```
┌─────────────────────────────────────────────────────────────┐
│  PLAYER JOURNEY                                             │
│                                                             │
│  1. Create or Join room using 6-digit code                  │
│  2. Wait for all players to be ready                        │
│  3. Race through 10 questions (10 seconds each)             │
│  4. See results: scores, times, rankings                    │
│  5. Review wrong answers with explanations                  │
└─────────────────────────────────────────────────────────────┘
```

---

## MVP Features

### 1. Room System
- **Create Room:** Select grade (2-4) and term (1-4), get shareable code
- **Join Room:** Enter 6-character code + nickname
- **Room Code:** Easy to share verbally (e.g., "ABC123")
- **MVP Capacity:** 2 players per room
- **Future:** Expand to 10+ players (class challenges)

### 2. Speed Challenge Gameplay
| Rule | Description |
|------|-------------|
| Questions | 10 per round, identical for all players |
| Timer | 10 seconds per question |
| No answer | Treated as wrong (0 points), auto-advance |
| Pacing | Independent - each player races at own speed |
| End | When all players finish |

### 3. Scoring & Winner
- **Points:** 1 point per correct answer
- **Tiebreaker:** Faster total time wins
- **MVP:** Single winner announcement
- **Future:** Leaderboard rankings for 3+ players

### 4. Wrong Answer Review
- After challenge ends, players can review their mistakes
- Shows: Question → Your answer → Correct answer → Explanation
- Educational value: Every loss becomes a learning moment

### 5. Player Identity (MVP)
- Anonymous: Nickname + device ID
- No signup required
- No persistent progress
- **Future:** Accounts, progress tracking, achievements

---

## Content: Singapore Math

### MVP Scope
- **Grades:** 2, 3, 4
- **Terms:** 1, 2, 3, 4 per grade
- **Questions:** 150 minimum (50 per grade)
- **Format:** Multiple choice (4 options), text-only
- **Topics:** Heuristics, Problem Solving

### Content Creation Workflow
```
AI Generation → Human Review → Database Import
     ↓              ↓              ↓
  Draft Q&A    Verify accuracy   Bulk insert
  from curriculum  & grade-level   to production
```

### Question Requirements
- Clear, unambiguous wording
- Grade-appropriate difficulty
- Explanation for every question (2-3 sentences)
- No images for MVP (text-only)

---

## User Flows

### Flow 1: Create Room
```
Home → "Create Room" → Select Grade → Select Term →
Show Room Code → Wait for Players → All Ready → Start Challenge
```

### Flow 2: Join Room
```
Home → "Join Room" → Enter Code → Enter Nickname →
Waiting Room → Ready Check → Start Challenge
```

### Flow 3: Speed Challenge
```
Question 1 (10s timer) → Answer/Timeout →
Question 2 → ... → Question 10 →
Waiting for others → Results → Review Wrong Answers
```

### Flow 4: Post-Challenge
```
Results Screen → "Review Mistakes" OR "Play Again" OR "New Room"
```

---

## Future Roadmap (Post-MVP)

### Phase 2: Multi-Player Expansion
- Support 3-10 players per room
- Leaderboard rankings (1st, 2nd, 3rd...)
- Class Challenge mode

### Phase 3: Accounts & Progress
- User registration (email/phone)
- Persistent stats and history
- Achievement badges

### Phase 4: Content Expansion
- Chinese language module
- English language module
- More grade levels (P1, P5, P6)

### Phase 5: Social Features
- Friend lists
- Challenge invitations
- School/Class groups

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Challenge completion rate | >80% |
| Review screen usage | >50% view their mistakes |
| Return sessions | >30% play again within 7 days |
| Avg challenges per session | >2 |

---

## Constraints & Assumptions

- **Offline:** Not supported in MVP (requires internet)
- **Devices:** Mobile-first web, works on tablets and desktop
- **Browsers:** Modern browsers (Chrome, Safari, Firefox)
- **Language:** English UI only for MVP
