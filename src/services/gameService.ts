import { supabase } from "../config/supabase";
import type { Answer, Question, Player } from "../types";
import type { AnswerWithQuestion } from "../types/review.ts";
import { validateAnswer } from "../utils/answerValidation";
import { ROOM_STATUS } from "../utils/constants";

/**
 * Fetches questions for a room by their IDs in order
 */
export async function fetchQuestionsByIds(
  questionIds: string[],
): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .in("id", questionIds);

  if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
  if (!data) return [];

  // Sort questions to match the order of questionIds
  const questionMap = new Map(data.map((q) => [q.id, q]));
  return questionIds.map((id) => questionMap.get(id)!).filter(Boolean);
}

interface SubmitAnswerParams {
  roomId: string;
  playerId: string;
  question: Question;
  questionIndex: number;
  selectedOptionIndex: number | null;
  answerText: string | null;
  answerTimeMs: number;
}

interface SubmitAnswerResult {
  isCorrect: boolean;
  newScore: number;
  newTotalTimeMs: number;
}

/**
 * Submits an answer and updates player progress
 */
export async function submitAnswer(
  params: SubmitAnswerParams,
): Promise<SubmitAnswerResult> {
  const {
    roomId,
    playerId,
    question,
    questionIndex,
    selectedOptionIndex,
    answerText,
    answerTimeMs,
  } = params;

  const isCorrect = validateAnswer(question, selectedOptionIndex, answerText);

  // Record the answer
  const { error: answerError } = await supabase.from("answers").insert({
    room_id: roomId,
    player_id: playerId,
    question_id: question.id,
    question_index: questionIndex,
    selected_option_index: selectedOptionIndex,
    answer_text: answerText,
    is_correct: isCorrect,
    answer_time_ms: answerTimeMs,
  });

  if (answerError)
    throw new Error(`Failed to record answer: ${answerError.message}`);

  // Fetch current player state
  const { data: player, error: playerError } = await supabase
    .from("room_players")
    .select("score, total_time_ms")
    .eq("id", playerId)
    .single();

  if (playerError || !player) throw new Error("Failed to fetch player state");

  const newScore = player.score + (isCorrect ? 1 : 0);
  const newTotalTimeMs = player.total_time_ms + answerTimeMs;

  // Update player progress
  const { error: updateError } = await supabase
    .from("room_players")
    .update({
      current_question_index: questionIndex + 1,
      score: newScore,
      total_time_ms: newTotalTimeMs,
    })
    .eq("id", playerId);

  if (updateError)
    throw new Error(`Failed to update progress: ${updateError.message}`);

  return { isCorrect, newScore, newTotalTimeMs };
}

/**
 * Marks a player as finished
 */
export async function markPlayerFinished(playerId: string): Promise<void> {
  const { error } = await supabase
    .from("room_players")
    .update({
      is_finished: true,
      finished_at: new Date().toISOString(),
    })
    .eq("id", playerId);

  if (error)
    throw new Error(`Failed to mark player as finished: ${error.message}`);
}

/**
 * Checks if all players in a room have finished
 */
export async function checkAllPlayersFinished(
  roomId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("room_players")
    .select("is_finished")
    .eq("room_id", roomId);

  if (error) throw new Error(`Failed to check players: ${error.message}`);
  return data?.every((p) => p.is_finished) ?? false;
}

/**
 * Updates room status to finished
 */
export async function markRoomFinished(roomId: string): Promise<void> {
  const { error } = await supabase
    .from("rooms")
    .update({
      status: ROOM_STATUS.FINISHED,
      finished_at: new Date().toISOString(),
    })
    .eq("id", roomId);

  if (error)
    throw new Error(`Failed to mark room as finished: ${error.message}`);
}

/**
 * Fetches all players in a room with their scores
 */
export async function fetchRoomResults(roomId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("score", { ascending: false })
    .order("total_time_ms", { ascending: true });

  if (error) throw new Error(`Failed to fetch results: ${error.message}`);
  return data || [];
}

export interface PlayerPostGameStats {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  accuracyPercent: number;
}

function isTimeoutAnswerRow(row: {
  selected_option_index: number | null;
  answer_text: string | null;
}): boolean {
  return row.selected_option_index === null && row.answer_text === null;
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
    if (isTimeoutAnswerRow(answer)) {
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

export async function fetchPlayerAnswersWithQuestions(
  roomId: string,
  playerId: string,
): Promise<AnswerWithQuestion[]> {
  const { data, error } = await supabase
    .from("answers")
    .select(
      "id, room_id, player_id, question_id, question_index, selected_option_index, answer_text, is_correct, answer_time_ms, answered_at, questions(*)",
    )
    .eq("room_id", roomId)
    .eq("player_id", playerId)
    .order("question_index", { ascending: true });

  if (error) throw new Error(`Failed to fetch answers: ${error.message}`);
  if (!data) return [];

  type AnswerRow = Answer & { questions: Question | null };
  const rows = data as unknown as AnswerRow[];

  const result: AnswerWithQuestion[] = [];
  for (const row of rows) {
    const question = row.questions;
    if (!question) continue;
    const answer: Answer = {
      id: row.id,
      room_id: row.room_id,
      player_id: row.player_id,
      question_id: row.question_id,
      question_index: row.question_index,
      selected_option_index: row.selected_option_index,
      answer_text: row.answer_text,
      is_correct: row.is_correct,
      answer_time_ms: row.answer_time_ms,
      answered_at: row.answered_at,
    };
    result.push({ answer, question });
  }
  return result;
}

export async function fetchPlayerReviewItemsForAllQuestions(params: {
  roomId: string;
  playerId: string;
  questionIds: string[];
  timePerQuestionSec: number;
}): Promise<AnswerWithQuestion[]> {
  const { roomId, playerId, questionIds, timePerQuestionSec } = params;

  const [questions, answersResult] = await Promise.all([
    fetchQuestionsByIds(questionIds),
    supabase
      .from("answers")
      .select(
        "id, room_id, player_id, question_id, question_index, selected_option_index, answer_text, is_correct, answer_time_ms, answered_at",
      )
      .eq("room_id", roomId)
      .eq("player_id", playerId),
  ]);

  if (answersResult.error)
    throw new Error(`Failed to fetch answers: ${answersResult.error.message}`);

  const answers = (answersResult.data ?? []) as Answer[];
  const answerByQuestionId = new Map<string, Answer>();
  for (const answer of answers) {
    answerByQuestionId.set(answer.question_id, answer);
  }

  const nowIso = new Date().toISOString();
  const timeoutTimeMs = timePerQuestionSec * 1000;

  const result: AnswerWithQuestion[] = [];
  for (
    let questionIndex = 0;
    questionIndex < questions.length;
    questionIndex += 1
  ) {
    const question = questions[questionIndex];
    if (!question) continue;

    const existingAnswer = answerByQuestionId.get(question.id);
    const answer: Answer =
      existingAnswer ??
      ({
        id: `missing:${roomId}:${playerId}:${questionIndex}`,
        room_id: roomId,
        player_id: playerId,
        question_id: question.id,
        question_index: questionIndex,
        selected_option_index: null,
        answer_text: null,
        is_correct: false,
        answer_time_ms: timeoutTimeMs,
        answered_at: nowIso,
      } satisfies Answer);

    result.push({ answer, question });
  }

  return result;
}

export async function fetchRoomResultsWithDerivedStats(
  roomId: string,
): Promise<Array<Player & { stats: PlayerPostGameStats }>> {
  const [playersResult, answersResult] = await Promise.all([
    supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId)
      .order("score", { ascending: false })
      .order("total_time_ms", { ascending: true }),
    supabase
      .from("answers")
      .select("player_id, is_correct, selected_option_index, answer_text")
      .eq("room_id", roomId),
  ]);

  if (playersResult.error)
    throw new Error(`Failed to fetch results: ${playersResult.error.message}`);
  if (answersResult.error)
    throw new Error(`Failed to fetch answers: ${answersResult.error.message}`);

  const players = playersResult.data ?? [];
  const answers = answersResult.data ?? [];

  const answersByPlayerId = new Map<
    string,
    Array<{
      is_correct: boolean;
      selected_option_index: number | null;
      answer_text: string | null;
    }>
  >();

  for (const answer of answers) {
    const list = answersByPlayerId.get(answer.player_id) ?? [];
    list.push(answer);
    answersByPlayerId.set(answer.player_id, list);
  }

  return players.map((player) => {
    const playerAnswers = answersByPlayerId.get(player.id) ?? [];
    return { ...player, stats: computePlayerPostGameStats(playerAnswers) };
  });
}

interface ForceFinishUnfinishedPlayersParams {
  roomId: string;
  questionsCount: number;
  timePerQuestionSec: number;
}

export async function forceFinishUnfinishedPlayers(
  params: ForceFinishUnfinishedPlayersParams,
): Promise<void> {
  const { roomId, questionsCount, timePerQuestionSec } = params;

  const { data: unfinishedPlayers, error } = await supabase
    .from("room_players")
    .select("id, current_question_index, total_time_ms")
    .eq("room_id", roomId)
    .eq("is_finished", false);

  if (error)
    throw new Error(`Failed to fetch unfinished players: ${error.message}`);
  if (!unfinishedPlayers || unfinishedPlayers.length === 0) return;

  const nowIso = new Date().toISOString();
  const timePerQuestionMs = timePerQuestionSec * 1000;

  for (const player of unfinishedPlayers) {
    const remainingQuestions = Math.max(
      questionsCount - player.current_question_index,
      0,
    );
    const penaltyMs = remainingQuestions * timePerQuestionMs;
    const newTotalTimeMs = player.total_time_ms + penaltyMs;

    const { error: updateError } = await supabase
      .from("room_players")
      .update({
        is_finished: true,
        finished_at: nowIso,
        current_question_index: questionsCount,
        total_time_ms: newTotalTimeMs,
      })
      .eq("id", player.id);

    if (updateError) {
      throw new Error(`Failed to force-finish player: ${updateError.message}`);
    }
  }
}
