import { create } from 'zustand'
import type { Question, Player } from '../types'
import {
  fetchQuestionsByIds,
  submitAnswer,
  markPlayerFinished,
  checkAllPlayersFinished,
  markRoomFinished,
} from '../services/gameService'
import { subscribeToGameProgress } from '../services/realtimeService'

interface GameState {
  // State
  questions: Question[]
  currentQuestionIndex: number
  score: number
  totalTimeMs: number
  isFinished: boolean
  isWaitingForOthers: boolean
  players: Player[]
  lastAnswerCorrect: boolean | null
  isLoading: boolean
  error: string | null

  // Actions
  loadQuestions: (questionIds: string[]) => Promise<void>
  hydrateFromPlayer: (player: Player) => void
  submitAnswer: (
    roomId: string,
    playerId: string,
    selectedOptionIndex: number | null,
    answerText: string | null,
    answerTimeMs: number
  ) => Promise<boolean>
  finishGame: (roomId: string, playerId: string) => Promise<void>
  nextQuestion: () => void
  subscribeToProgress: (roomId: string) => () => void
  reset: () => void

  // Computed
  currentQuestion: () => Question | null
  totalQuestions: () => number
  isLastQuestion: () => boolean
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  totalTimeMs: 0,
  isFinished: false,
  isWaitingForOthers: false,
  players: [],
  lastAnswerCorrect: null,
  isLoading: false,
  error: null,

  // Load questions for the game
  loadQuestions: async (questionIds) => {
    set({ isLoading: true, error: null })
    try {
      const questions = await fetchQuestionsByIds(questionIds)
      set({ questions, isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load questions',
        isLoading: false,
      })
      throw err
    }
  },

  hydrateFromPlayer: (player) => {
    const { questions } = get()
    const maxIndex = Math.max(0, questions.length - 1)
    const currentQuestionIndex =
      questions.length === 0
        ? 0
        : Math.min(Math.max(player.current_question_index, 0), maxIndex)

    set({
      currentQuestionIndex,
      score: player.score,
      totalTimeMs: player.total_time_ms,
      isFinished: player.is_finished,
      isWaitingForOthers: player.is_finished,
      lastAnswerCorrect: null,
      error: null,
    })
  },

  // Submit an answer
  submitAnswer: async (roomId, playerId, selectedOptionIndex, answerText, answerTimeMs) => {
    const { questions, currentQuestionIndex } = get()
    const question = questions[currentQuestionIndex]
    if (!question) return false

    try {
      const result = await submitAnswer({
        roomId,
        playerId,
        question,
        questionIndex: currentQuestionIndex,
        selectedOptionIndex,
        answerText,
        answerTimeMs,
      })

      set({
        score: result.newScore,
        totalTimeMs: result.newTotalTimeMs,
        lastAnswerCorrect: result.isCorrect,
      })

      return result.isCorrect
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to submit answer' })
      return false
    }
  },

  // Move to next question
  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get()
    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        lastAnswerCorrect: null,
      })
    }
  },

  // Finish the game for this player
  finishGame: async (roomId, playerId) => {
    try {
      await markPlayerFinished(playerId)
      set({ isFinished: true, isWaitingForOthers: true })

      // Check if all players finished
      const allFinished = await checkAllPlayersFinished(roomId)
      if (allFinished) {
        await markRoomFinished(roomId)
        set({ isWaitingForOthers: false })
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to finish game' })
    }
  },

  // Subscribe to other players' progress
  subscribeToProgress: (roomId) => {
    const subscription = subscribeToGameProgress(roomId, (players) => {
      set((state) => {
        if (!state.isFinished) return { players }
        const allFinished = players.every((p) => p.is_finished)
        if (!allFinished || !state.isWaitingForOthers) return { players }
        return { players, isWaitingForOthers: false }
      })
    })

    return subscription.unsubscribe
  },

  // Reset game state
  reset: () => {
    set({
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      totalTimeMs: 0,
      isFinished: false,
      isWaitingForOthers: false,
      players: [],
      lastAnswerCorrect: null,
      isLoading: false,
      error: null,
    })
  },

  // Computed values
  currentQuestion: () => {
    const { questions, currentQuestionIndex } = get()
    return questions[currentQuestionIndex] || null
  },

  totalQuestions: () => get().questions.length,

  isLastQuestion: () => {
    const { currentQuestionIndex, questions } = get()
    return currentQuestionIndex >= questions.length - 1
  },
}))
