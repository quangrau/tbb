# Plan: Enhance Create Room Page Options

## Goal

Update the Create Room page to:
1. Support all grades P1-P6 (currently P2-P4)
2. Add "All" option for terms as the default (currently only T1-T4)
3. Allow customizing challenge settings: questions count, time per question, max players

---

## Current State

**`src/utils/constants.ts`**:
- `GRADE_OPTIONS`: Only P2, P3, P4
- `TERM_OPTIONS`: T1-T4, no "All" option
- Defaults: 10 questions, 10 seconds, 2 players

**`src/pages/CreateRoomPage.tsx`**:
- Grade and term selectors only
- No challenge settings UI
- Calls `createRoom(grade, term, deviceId, nickname)`

**`src/services/roomService.ts`**:
- `fetchRandomQuestionIds(grade, term, count)` - filters by exact grade and term
- `createRoom()` uses hardcoded `DEFAULT_*` constants

---

## Changes Required

### 1. Update Constants (`src/utils/constants.ts`)

```typescript
// Expand grades to P1-P6
export const GRADE_OPTIONS = [
  { value: 1, label: 'P1' },
  { value: 2, label: 'P2' },
  { value: 3, label: 'P3' },
  { value: 4, label: 'P4' },
  { value: 5, label: 'P5' },
  { value: 6, label: 'P6' },
]

// Add "All" term option (value: 0 or null to represent all)
export const TERM_OPTIONS = [
  { value: 0, label: 'All' },  // Default
  { value: 1, label: 'T1' },
  { value: 2, label: 'T2' },
  { value: 3, label: 'T3' },
  { value: 4, label: 'T4' },
]

// Challenge settings options
export const QUESTIONS_COUNT_OPTIONS = [5, 10, 15, 20]
export const TIME_PER_QUESTION_OPTIONS = [5, 10, 15, 20, 30]  // seconds
export const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6]
```

### 2. Update Room Service (`src/services/roomService.ts`)

**`fetchRandomQuestionIds`** - Handle "All" terms (term = 0 or null):
```typescript
async function fetchRandomQuestionIds(
  grade: number,
  term: number | null,  // null = all terms
  count: number
): Promise<string[]> {
  let query = supabase.from('questions').select('id').eq('grade', grade)

  // Only filter by term if specific term selected
  if (term && term > 0) {
    query = query.eq('term', term)
  }

  const { data, error } = await query
  // ... rest of logic
}
```

**`CreateRoomParams`** - Add settings:
```typescript
interface CreateRoomParams {
  grade: number
  term: number | null
  deviceId: string
  nickname: string
  questionsCount?: number
  timePerQuestionSec?: number
  maxPlayers?: number
}
```

### 3. Update Room Store (`src/stores/roomStore.ts`)

Update `createRoom` signature:
```typescript
createRoom: (
  grade: number,
  term: number | null,
  deviceId: string,
  nickname: string,
  settings?: {
    questionsCount?: number
    timePerQuestionSec?: number
    maxPlayers?: number
  }
) => Promise<void>
```

### 4. Update Create Room Page (`src/pages/CreateRoomPage.tsx`)

Add state for settings:
```typescript
const [term, setTerm] = useState(0)  // Default to "All"
const [showSettings, setShowSettings] = useState(false)  // Collapsed by default
const [questionsCount, setQuestionsCount] = useState(DEFAULT_QUESTIONS_COUNT)
const [timePerQuestion, setTimePerQuestion] = useState(DEFAULT_TIME_PER_QUESTION_SEC)
const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS)
```

Add UI sections for:
- **Grade selector**: 6 buttons in 2 rows (P1-P6)
- **Term selector**: 5 buttons (All, T1-T4) with "All" pre-selected
- **Collapsible "Challenge Settings"** section (**collapsed by default**):
  - Questions count selector
  - Time per question selector
  - Max players selector

Philosophy: Keep the default view as simple as possible. Most users just need grade + term.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/constants.ts` | Expand grades, add "All" term, add settings options |
| `src/services/roomService.ts` | Update params interface and query logic |
| `src/stores/roomStore.ts` | Update createRoom signature |
| `src/pages/CreateRoomPage.tsx` | Add settings UI and state |

---

## UI Layout

**Default view (collapsed):**
```
┌─────────────────────────────────────┐
│           Create Room               │
│                                     │
│  Your Nickname: [____________]      │
│                                     │
│  Grade Level                        │
│  [P1] [P2] [P3*] [P4] [P5] [P6]    │
│                                     │
│  Knowledge Range                    │
│  [All*] [T1] [T2] [T3] [T4]        │
│                                     │
│  ▶ Challenge Settings               │  ← collapsed by default
│                                     │
│        [Create Room]                │
│           [Back]                    │
└─────────────────────────────────────┘
```

**Expanded view (when user clicks to expand):**
```
│  ▼ Challenge Settings               │
│  ┌─────────────────────────────┐   │
│  │ Questions:  [5][10*][15][20]│   │
│  │ Time/Q:     [5][10*][15]... │   │
│  │ Max Players:[2*][3][4][5][6]│   │
│  └─────────────────────────────┘   │
```
* = default/selected

---

## Notes

- **No migration needed**: `rooms.term` has no CHECK constraint, so storing `0` for "All" works
- **Questions table unaffected**: Questions still have specific terms (1-4), only query logic changes
- The term value `0` in the database will represent "All terms" for display and query purposes

---

## Verification

1. Run `npm run dev`
2. Navigate to Create Room
3. Verify:
   - All 6 grades (P1-P6) are visible and selectable
   - Term defaults to "All", all 5 options work
   - Challenge settings section allows customization
   - Creating a room with "All" terms pulls questions from any term
   - Custom settings are reflected in the room (check via Supabase Studio)
