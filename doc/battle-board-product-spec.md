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
│  1. Create or Join room using 6-character code              │
│  2. Wait for all players to be ready                        │
│  3. Race through a timed question set                       │
│  4. See results: score, time, and stats                     │
│  5. Review questions with explanations                      │
└─────────────────────────────────────────────────────────────┘
```

---

## MVP Features

### 1. Room System
- **Create Room:** Select grade (P1-P6) and term (All/T1-T4), get shareable code
- **Challenge Settings:** Configure questions count, time per question, max players
- **Join Room:** Enter 6-character code + nickname
- **Room Code:** Easy to share verbally (e.g., "ABC123")
- **Capacity:** 2-6 players per room (default 5)
- **Lobby:** Realtime player list, ready states, online/offline indicator, host start rules
- **Future:** Expand to 10+ players (class challenges)

### 2. Speed Challenge Gameplay
| Rule | Description |
|------|-------------|
| Questions | Configurable count per round, identical for all players |
| Question types | Multiple choice and free-form |
| Timer | Configurable seconds per question |
| No answer | Treated as wrong (0 points), auto-advance |
| Pacing | Independent - each player races at own speed |
| End | When all players finish |
| Cutoff | Global cutoff force-finishes unfinished players with a time penalty |

### 3. Scoring & Winner
- **Points:** 1 point per correct answer
- **Tiebreaker:** Faster total time wins
- **MVP:** Winner or draw announcement, ranking list
- **Stats:** Accuracy, wrong answers, timeouts

### 4. Review & Reporting
- After challenge ends, players can review all questions
- Shows: Question → Your answer (or timeout) → Correct answer → Explanation
- Filter to review incorrect/timeout questions
- Report issue from review (incorrect answer/explanation, typo, ambiguous, other)

### 5. Player Identity (MVP)
- Anonymous: Nickname + device ID
- No signup required
- No persistent progress
- **Future:** Accounts, progress tracking, achievements

---

## Content: Singapore Math

### MVP Scope
- **Grades:** P1-P6
- **Terms:** All, T1, T2, T3, T4
- **Questions:** 150 minimum (50 per grade)
- **Format:** Multiple choice and free-form, text-first with inline math
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
- No images for MVP
- Inline math is supported using $...$ delimiters

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
Question 1 (timer) → Answer/Timeout →
Question 2 → ... →
Waiting for others → Results → Review Questions
```

### Flow 4: Post-Challenge
```
Results Screen → "Review" OR "Play Again" OR "New Room"
```

---

## Future Roadmap (Post-MVP)

### Phase 2: Multi-Player Expansion
- Support 10+ players per room
- Advanced leaderboard rankings and class/group modes
- Class Challenge mode

### Phase 3: Accounts & Progress
- User registration (email/phone)
- Persistent stats and history
- Achievement badges

### Phase 4: Content Expansion
- Chinese language module
- English language module
- More grade levels and topics

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
