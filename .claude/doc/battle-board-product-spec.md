# The Battle Board - Product Specification

## Vision
The most engaging, high-quality multiplayer learning experience for primary school students, fully aligned with the **Singapore MOE curriculum** across all subjects.

---

## Core Concept: Speed Challenge

A real-time multiplayer quiz where players race to answer questions correctly. Each player competes independently on their own device, with results compared at the end.

```
┌─────────────────────────────────────────────────────────────┐
│  PLAYER JOURNEY                                             │
│                                                             │
│  1. Create or Join room using 6-character code              │
│  2. Wait for all players to be ready                        │
│  3. Race through a timed question set (configurable)        │
│  4. See results: scores, times, rankings                    │
│  5. Review wrong answers with explanations                  │
└─────────────────────────────────────────────────────────────┘
```

---

## MVP Features

### 1. Room System
- **Create Room:** Select subject, grade, term, and configure settings
- **Join Room:** Enter 6-character code + nickname
- **Room Code:** Easy to share verbally (e.g., "ABC123")
- **Flexible Configuration:** Room creator can customize question count, time per question, and player limit
- **Default Settings:** 10 questions, 10 seconds per question, 5 players max
- **Future:** Expand to 10+ players (class challenges)

### 2. Speed Challenge Gameplay
| Rule | Description |
|------|-------------|
| Questions | Configurable count (default: 10), identical for all players |
| Timer | Configurable per question (default: 10 seconds) |
| Players | Configurable limit (default: 5 players) |
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

## Content: Singapore MOE Curriculum

### Platform Scope
The Battle Board supports **all primary school subjects** aligned with the Singapore MOE curriculum:
- **MVP:** Mathematics
- **Future:** English, Chinese (Mother Tongue), Science

### MVP Scope (Mathematics)
- **Grades:** Primary 1-6
- **Terms:** 4 terms per grade
- **Questions:** 150 minimum
- **Topics:** Heuristics, Problem Solving

### Question Types
| Type | Description | Status |
|------|-------------|--------|
| **Quiz** | Multiple choice with single correct answer | MVP |
| **Free-form** | Open text input answer | MVP |
| **Multiple Selection** | Multiple choice with multiple correct answers | Future |
| **Multiple Free-form** | Multiple open text inputs | Future |

### Question Media Support
- **Text:** Supported (MVP)
- **Images:** Supported (MVP)
- **Video:** Supported (Future enhancement)

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
- Aligned with Singapore MOE syllabus

---

## User Flows

### Flow 1: Create Room
```
Home → "Create Room" → Select Subject → Select Grade → Select Term →
Configure Settings (optional) → Show Room Code → Wait for Players →
All Ready → Start Challenge
```

### Flow 2: Join Room
```
Home → "Join Room" → Enter Code → Enter Nickname →
Waiting Room → Ready Check → Start Challenge
```

### Flow 3: Speed Challenge
```
Question 1 (timed) → Answer/Timeout →
Question 2 → ... → Question N →
Waiting for others → Results → Review Wrong Answers
```

### Flow 4: Post-Challenge
```
Results Screen → "Review Mistakes" OR "Play Again" OR "New Room"
```

---

## Future Roadmap (Post-MVP)

### Phase 2: Subject Expansion
- English Language module (aligned with MOE syllabus)
- Chinese (Mother Tongue) module
- Science module

### Phase 3: Advanced Question Types
- Multiple selection questions
- Multiple free-form inputs
- Video-based questions
- Interactive problem-solving

### Phase 4: Multi-Player Expansion
- Support 10+ players per room
- Leaderboard rankings (1st, 2nd, 3rd...)
- Class Challenge mode
- Tournament brackets

### Phase 5: Accounts & Progress
- User registration (email/phone)
- Persistent stats and history
- Achievement badges
- Learning analytics

### Phase 6: Social Features
- Friend lists
- Challenge invitations
- School/Class groups
- Teacher dashboard

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
