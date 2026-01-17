# Plan: Post-Challenge Enhancements

## Goal

Improve the post-challenge experience with:

1. Richer results details (more than just score + total time)
2. A review flow to revisit questions and read explanations
3. A lightweight “report issue” flow for wrong questions/answers/explanations

## Non-Goals (for this iteration)

- Player accounts / Supabase Auth (can be added later)
- Teacher dashboards / moderation UI
- Complex analytics beyond a single room run

---

## Current State (Code)

- Results UI exists but is minimal:
  - `src/pages/ResultsPage.tsx`: ranking list, score + total time, play again/back to home
  - `src/services/gameService.ts`: `fetchRoomResults(roomId)` sorts by score desc, total_time_ms asc
- No question review flow:
  - No `ReviewPage` and no route entry in `src/App.tsx` / `ROUTES`
- No “report wrong question/answer” flow:
  - No UI entry point, no service function, and no database table/type for reports
- Answers are recorded but never read back for review:
  - `src/services/gameService.ts`: `submitAnswer` inserts into `answers` with `selected_option_index` and `answer_text`

---

## Product Requirements

### 1) Results Details

Show, per player:

- Score
- Total time (existing)
- Accuracy (% correct)
- Wrong count
- Timeout count (when `selected_option_index` and `answer_text` are both null)
- Completion indicator (finished vs unfinished/forfeited)

Recommended UX additions:

- Highlight the current player (“You”)
- Show a simple winner header (or “Draw” when tied)
- Add a primary CTA: “Review Mistakes” (shown even if 0 mistakes, leading to “All correct” state)

### 2) Review Questions + Explanation

Review is scoped to the current player:

- Preserve the original order (by `question_index`)
- For each question:
  - Question text + options (or free-form prompt)
  - “Your answer” (selected option label or typed answer text)
  - “Correct answer”
  - Explanation (from `questions.explanation`)
  - Time taken
- Filters:
  - All
  - Wrong only
  - Timeout only
- Empty state when everything is correct

### 3) Report Wrong Question/Answer

From Review, allow reporting issues per question:

- Report types:
  - Incorrect correct answer
  - Incorrect explanation
  - Typo/formatting
  - Ambiguous question
  - Other
- Allow optional text detail and include the player’s answer context automatically
- After submit: disable the button and show a “Reported” state for that question (local UX)

---

## Technical Plan

### A) Data Fetching for Post-Challenge

Add new read APIs in `src/services/gameService.ts`:

- `fetchPlayerAnswersWithQuestions(roomId, playerId)`
  - Query `answers` filtered by `room_id` + `player_id`
  - Join `questions` for review rendering
  - Sort by `question_index` ascending
- `computePlayerPostGameStats(answers)`
  - Derive accuracy, wrong/timeout counts, average time, etc

Add a results composition helper:

- `fetchRoomResultsWithDerivedStats(roomId)`
  - Fetch ranked players using existing `fetchRoomResults`
  - Fetch answers for all players in the room (single query by `room_id`)
  - Compute per-player derived stats in-memory

Notes:

- Room sizes are small (MVP), so in-memory aggregation is fine.
- Keep derived fields out of `room_players` to avoid write amplification and drift.

### B) UI/Routes

Add a new page:

- `src/pages/ReviewPage.tsx`

Update routing:

- Add `ROUTES.review = "/review"`
- Add `<Route path={ROUTES.review} element={<ReviewPage />} />` in `src/App.tsx`

ResultsPage enhancements (`src/pages/ResultsPage.tsx`):

- Add a “Results summary” section for the current player
- Extend each ranked row with derived fields (accuracy, timeouts)
- Add button: “Review Mistakes” → navigate to `ROUTES.review`

ReviewPage UX:

- Load room + current player using the same restore logic as ResultsPage
- Fetch answers+questions for the current player
- Render a list with expandable “Explanation”
- Add “Report issue” per question (opens modal/dialog)

Suggested reusable components:

- `src/components/ResultsSummary.tsx`
- `src/components/ReviewQuestionItem.tsx`
- `src/components/ReportIssueDialog.tsx`

### C) Reporting Model (Database)

Add a new table (Supabase migration recommended):

```sql
create table question_reports (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id),
  room_id uuid references rooms(id) on delete set null,
  player_id uuid references room_players(id) on delete set null,
  report_type text not null,
  report_text text,
  selected_option_index int,
  answer_text text,
  created_at timestamptz not null default now()
);

create index idx_question_reports_question_id on question_reports(question_id);
create index idx_question_reports_room_id on question_reports(room_id);
```

Client write API:

- `src/services/reportService.ts`: `submitQuestionReport({ questionId, roomId, playerId, reportType, reportText, selectedOptionIndex, answerText })`

Access control recommendation:

- MVP: allow inserts, disallow selects for anon (prevents casual data leakage).
- Later (with Auth): allow players to read their own reports and allow admins to triage.

---

## Files To Add / Modify

| File                            | Change                                            |
| ------------------------------- | ------------------------------------------------- |
| `src/utils/constants.ts`        | Add `ROUTES.review` and any label constants       |
| `src/App.tsx`                   | Add Review route                                  |
| `src/pages/ResultsPage.tsx`     | Add results details + “Review” CTA                |
| `src/pages/ReviewPage.tsx`      | New page for per-question review                  |
| `src/services/gameService.ts`   | Add answer+question fetching and stats derivation |
| `src/services/reportService.ts` | Add report submission                             |
| `src/types/database.ts`         | Regenerate types after adding `question_reports`  |

---

## Verification

Manual verification checklist:

- Finish a game, open Results:
  - Ranking still correct (score desc, time asc)
  - Derived stats show plausible values (accuracy, wrong/timeouts)
  - “Review Mistakes” navigates correctly
- Review page:
  - Shows questions in the same order as played
  - Shows your answer, correct answer, and explanation correctly
  - Filters work (all/wrong/timeout)
  - “All correct” state renders when applicable
- Reporting:
  - Submitting a report succeeds and the UI reflects “Reported”
  - Duplicate submissions are prevented client-side for the same question in the same session
