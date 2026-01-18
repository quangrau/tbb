import type { Answer, Player, Question } from "../../types/database";
import type { AnswerWithQuestion } from "../../types/review";

export interface PlayerPostGameStats {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  accuracyPercent: number;
}

type SubmitAnswerParams = {
  roomId: string;
  playerId: string;
  question: Question;
  questionIndex: number;
  selectedOptionIndex: number | null;
  answerText: string | null;
  answerTimeMs: number;
};

type SubmitAnswerResult = {
  isCorrect: boolean;
  newScore: number;
  newTotalTimeMs: number;
};

function nowIso(): string {
  return new Date().toISOString();
}

function buildQuestion(
  id: string,
  overrides: Partial<Question> = {},
): Question {
  return {
    id,
    grade: 3,
    term: 0,
    question_text: "2 + 3 = ?",
    options: ["4", "5", "6", "7"],
    correct_option_index: 1,
    explanation: "2 + 3 = 5",
    created_at: nowIso(),
    question_type: "multiple_choice",
    correct_answer: null,
    acceptable_answers: null,
    answer_unit: null,
    answer_type: "integer",
    ...overrides,
  };
}

function buildFreeFormQuestion(
  id: string,
  overrides: Partial<Question> = {},
): Question {
  return buildQuestion(id, {
    question_text: "Write the number seven.",
    options: null,
    correct_option_index: null,
    question_type: "free_form",
    correct_answer: "7",
    acceptable_answers: ["7", "seven"],
    explanation: "Seven is written as 7.",
    answer_type: "integer",
    ...overrides,
  });
}

function buildAnswer(overrides: Partial<Answer> = {}): Answer {
  return {
    id: "sb-answer-1",
    room_id: "sb-room-1",
    player_id: "sb-player-1",
    question_id: "sb-q-1",
    question_index: 0,
    selected_option_index: 1,
    answer_text: null,
    is_correct: true,
    answer_time_ms: 4200,
    answered_at: nowIso(),
    ...overrides,
  };
}

export async function fetchQuestionsByIds(
  questionIds: string[],
): Promise<Question[]> {
  return questionIds.map((id, idx) =>
    idx % 2 === 0 ? buildQuestion(id) : buildFreeFormQuestion(id),
  );
}

export async function submitAnswer(
  params: SubmitAnswerParams,
): Promise<SubmitAnswerResult> {
  const isCorrect =
    params.question.question_type === "multiple_choice"
      ? params.selectedOptionIndex === params.question.correct_option_index
      : params.answerText !== null &&
        (params.answerText.trim() === "7" ||
          params.answerText.trim().toLowerCase() === "seven");

  return {
    isCorrect,
    newScore: isCorrect ? 1 : 0,
    newTotalTimeMs: params.answerTimeMs,
  };
}

export async function markPlayerFinished(playerId: string): Promise<void> {
  void playerId;
}

export async function checkAllPlayersFinished(
  roomId: string,
): Promise<boolean> {
  void roomId;
  return true;
}

export async function markRoomFinished(roomId: string): Promise<void> {
  void roomId;
}

export async function fetchRoomResults(roomId: string): Promise<Player[]> {
  void roomId;
  return [];
}

export function computePlayerPostGameStats(
  answers: Array<{
    is_correct: boolean;
    selected_option_index: number | null;
    answer_text: string | null;
  }>,
): PlayerPostGameStats {
  const totalQuestions = answers.length;
  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
      accuracyPercent: 0,
    };
  }

  let correctCount = 0;
  let wrongCount = 0;
  let timeoutCount = 0;

  for (const answer of answers) {
    if (answer.is_correct) {
      correctCount += 1;
      continue;
    }
    const isTimeout =
      answer.selected_option_index === null && answer.answer_text === null;
    if (isTimeout) {
      timeoutCount += 1;
      continue;
    }
    wrongCount += 1;
  }

  const accuracyPercent = Math.round((correctCount / totalQuestions) * 100);
  return {
    totalQuestions,
    correctCount,
    wrongCount,
    timeoutCount,
    accuracyPercent,
  };
}

export async function fetchPlayerAnswersWithQuestions(params: {
  roomId: string;
  playerId: string;
}): Promise<AnswerWithQuestion[]> {
  void params;
  return [];
}

export async function fetchPlayerReviewItemsForAllQuestions(params: {
  roomId: string;
  playerId: string;
  questionIds: string[];
  timePerQuestionSec: number;
}): Promise<AnswerWithQuestion[]> {
  if (params.roomId === "sb-room-review-error") {
    throw new Error("Failed to load review");
  }
  if (params.roomId === "sb-room-review-empty") {
    return [];
  }

  const questions = await fetchQuestionsByIds(params.questionIds);
  return questions.map((q, idx) => {
    const isFreeForm = q.question_type === "free_form";
    const isCorrect =
      params.roomId === "sb-room-review-all-correct" ? true : idx % 3 === 0;
    const isTimeout = idx % 5 === 0;

    const answer = buildAnswer({
      id: `sb-answer-${idx + 1}`,
      room_id: params.roomId,
      player_id: params.playerId,
      question_id: q.id,
      question_index: idx,
      selected_option_index:
        isTimeout || isFreeForm ? null : isCorrect ? q.correct_option_index : 0,
      answer_text: isTimeout
        ? null
        : isFreeForm
          ? isCorrect
            ? "7"
            : "8"
          : null,
      is_correct: isTimeout ? false : isCorrect,
      answer_time_ms: isTimeout
        ? params.timePerQuestionSec * 1000
        : 3500 + idx * 250,
    });

    return { question: q, answer };
  });
}

export async function fetchRoomResultsWithDerivedStats(
  roomId: string,
): Promise<Array<Player & { stats: PlayerPostGameStats }>> {
  if (roomId === "sb-room-results-error") {
    throw new Error("Failed to load results");
  }

  const basePlayer = (overrides: Partial<Player>): Player => ({
    id: "sb-player-1",
    room_id: roomId,
    device_id: "sb-device-1",
    nickname: "Player",
    is_ready: true,
    is_finished: true,
    current_question_index: 10,
    score: 0,
    total_time_ms: 0,
    joined_at: nowIso(),
    finished_at: nowIso(),
    last_heartbeat: nowIso(),
    is_owner: false,
    ...overrides,
  });

  const host = basePlayer({
    id: "sb-player-1",
    nickname: "Host",
    is_owner: true,
    score: 8,
    total_time_ms: 38000,
  });
  const guest = basePlayer({
    id: "sb-player-2",
    nickname: "Guest",
    score: 7,
    total_time_ms: 41000,
  });

  const hostStats = computePlayerPostGameStats(
    Array.from({ length: 10 }, (_, i) => ({
      is_correct: i % 4 !== 0,
      selected_option_index: i % 4 === 0 ? null : 1,
      answer_text: null,
    })),
  );
  const guestStats = computePlayerPostGameStats(
    Array.from({ length: 10 }, (_, i) => ({
      is_correct: i % 3 !== 0,
      selected_option_index: i % 3 === 0 ? null : 1,
      answer_text: null,
    })),
  );

  return [
    { ...host, stats: hostStats },
    { ...guest, stats: guestStats },
  ];
}

export async function forceFinishUnfinishedPlayers(params: {
  roomId: string;
  questionsCount: number;
  timePerQuestionSec: number;
}): Promise<void> {
  void params;
}

