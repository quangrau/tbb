import { supabase } from '../config/supabase'
import type { Question, Player } from '../types'
import { validateAnswer } from '../utils/answerValidation'

/**
 * Fetches questions for a room by their IDs in order
 */
export async function fetchQuestionsByIds(questionIds: string[]): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .in('id', questionIds)

  if (error) throw new Error(`Failed to fetch questions: ${error.message}`)
  if (!data) return []

  // Sort questions to match the order of questionIds
  const questionMap = new Map(data.map(q => [q.id, q]))
  return questionIds.map(id => questionMap.get(id)!).filter(Boolean)
}

interface SubmitAnswerParams {
  roomId: string
  playerId: string
  question: Question
  questionIndex: number
  selectedOptionIndex: number | null
  answerText: string | null
  answerTimeMs: number
}

interface SubmitAnswerResult {
  isCorrect: boolean
  newScore: number
  newTotalTimeMs: number
}

/**
 * Submits an answer and updates player progress
 */
export async function submitAnswer(params: SubmitAnswerParams): Promise<SubmitAnswerResult> {
  const {
    roomId,
    playerId,
    question,
    questionIndex,
    selectedOptionIndex,
    answerText,
    answerTimeMs,
  } = params

  const isCorrect = validateAnswer(question, selectedOptionIndex, answerText)

  // Record the answer
  const { error: answerError } = await supabase
    .from('answers')
    .insert({
      room_id: roomId,
      player_id: playerId,
      question_id: question.id,
      question_index: questionIndex,
      selected_option_index: selectedOptionIndex,
      answer_text: answerText,
      is_correct: isCorrect,
      answer_time_ms: answerTimeMs,
    })

  if (answerError) throw new Error(`Failed to record answer: ${answerError.message}`)

  // Fetch current player state
  const { data: player, error: playerError } = await supabase
    .from('room_players')
    .select('score, total_time_ms')
    .eq('id', playerId)
    .single()

  if (playerError || !player) throw new Error('Failed to fetch player state')

  const newScore = player.score + (isCorrect ? 1 : 0)
  const newTotalTimeMs = player.total_time_ms + answerTimeMs

  // Update player progress
  const { error: updateError } = await supabase
    .from('room_players')
    .update({
      current_question_index: questionIndex + 1,
      score: newScore,
      total_time_ms: newTotalTimeMs,
    })
    .eq('id', playerId)

  if (updateError) throw new Error(`Failed to update progress: ${updateError.message}`)

  return { isCorrect, newScore, newTotalTimeMs }
}

/**
 * Marks a player as finished
 */
export async function markPlayerFinished(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('room_players')
    .update({
      is_finished: true,
      finished_at: new Date().toISOString(),
    })
    .eq('id', playerId)

  if (error) throw new Error(`Failed to mark player as finished: ${error.message}`)
}

/**
 * Checks if all players in a room have finished
 */
export async function checkAllPlayersFinished(roomId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('room_players')
    .select('is_finished')
    .eq('room_id', roomId)

  if (error) throw new Error(`Failed to check players: ${error.message}`)
  return data?.every(p => p.is_finished) ?? false
}

/**
 * Updates room status to finished
 */
export async function markRoomFinished(roomId: string): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'finished',
      finished_at: new Date().toISOString(),
    })
    .eq('id', roomId)

  if (error) throw new Error(`Failed to mark room as finished: ${error.message}`)
}

/**
 * Fetches all players in a room with their scores
 */
export async function fetchRoomResults(roomId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', roomId)
    .order('score', { ascending: false })
    .order('total_time_ms', { ascending: true })

  if (error) throw new Error(`Failed to fetch results: ${error.message}`)
  return data || []
}

interface ForceFinishUnfinishedPlayersParams {
  roomId: string
  questionsCount: number
  timePerQuestionSec: number
}

export async function forceFinishUnfinishedPlayers(
  params: ForceFinishUnfinishedPlayersParams
): Promise<void> {
  const { roomId, questionsCount, timePerQuestionSec } = params

  const { data: unfinishedPlayers, error } = await supabase
    .from('room_players')
    .select('id, current_question_index, total_time_ms')
    .eq('room_id', roomId)
    .eq('is_finished', false)

  if (error) throw new Error(`Failed to fetch unfinished players: ${error.message}`)
  if (!unfinishedPlayers || unfinishedPlayers.length === 0) return

  const nowIso = new Date().toISOString()
  const timePerQuestionMs = timePerQuestionSec * 1000

  for (const player of unfinishedPlayers) {
    const remainingQuestions = Math.max(questionsCount - player.current_question_index, 0)
    const penaltyMs = remainingQuestions * timePerQuestionMs
    const newTotalTimeMs = player.total_time_ms + penaltyMs

    const { error: updateError } = await supabase
      .from('room_players')
      .update({
        is_finished: true,
        finished_at: nowIso,
        current_question_index: questionsCount,
        total_time_ms: newTotalTimeMs,
      })
      .eq('id', player.id)

    if (updateError) {
      throw new Error(`Failed to force-finish player: ${updateError.message}`)
    }
  }
}
