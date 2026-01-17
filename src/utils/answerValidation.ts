import type { Question } from '../types'

/**
 * Parses a string input as a numeric value.
 * Supports integers, decimals, and fractions (e.g., "1/2", "3/4").
 */
export function parseNumericValue(input: string): number | null {
  const trimmed = input.trim()

  // Handle empty input
  if (!trimmed) return null

  // Handle fractions: "1/2", "3/4"
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/')
    if (parts.length !== 2) return null

    const num = parseFloat(parts[0].trim())
    const denom = parseFloat(parts[1].trim())

    if (isNaN(num) || isNaN(denom) || denom === 0) {
      return null
    }
    return num / denom
  }

  // Handle decimals and integers
  const value = parseFloat(trimmed)
  return isNaN(value) ? null : value
}

/**
 * Validates a free-form answer against the question's correct answer.
 * Supports numeric comparison for integers, decimals, and fractions.
 */
export function validateFreeFormAnswer(
  userAnswer: string,
  question: Question
): boolean {
  const { correct_answer, acceptable_answers, answer_type } = question

  if (!correct_answer) return false

  // Numeric types: compare as numbers (handles 22 = 22.0, 1/2 = 0.5)
  if (answer_type && ['integer', 'decimal', 'fraction'].includes(answer_type)) {
    const userValue = parseNumericValue(userAnswer)
    const correctValue = parseNumericValue(correct_answer)

    if (userValue !== null && correctValue !== null) {
      // Use small epsilon for floating point comparison
      if (Math.abs(userValue - correctValue) < 0.0001) return true
    }

    // Also check acceptable_answers for alternative representations
    if (acceptable_answers && acceptable_answers.length > 0) {
      return acceptable_answers.some(alt => {
        const altValue = parseNumericValue(alt)
        return userValue !== null && altValue !== null &&
               Math.abs(userValue - altValue) < 0.0001
      })
    }

    return false
  }

  // Text type: exact string match (case-insensitive)
  const normalized = userAnswer.trim().toLowerCase()
  if (normalized === correct_answer.trim().toLowerCase()) return true

  // Check acceptable_answers
  if (acceptable_answers && acceptable_answers.length > 0) {
    return acceptable_answers.some(
      alt => alt.trim().toLowerCase() === normalized
    )
  }

  return false
}

/**
 * Validates any answer (multiple choice or free-form) against the question.
 */
export function validateAnswer(
  question: Question,
  selectedOptionIndex: number | null,
  answerText: string | null
): boolean {
  if (question.question_type === 'free_form') {
    return answerText !== null && validateFreeFormAnswer(answerText, question)
  }

  // Multiple choice: compare selected index with correct index
  return selectedOptionIndex !== null &&
         question.correct_option_index !== null &&
         selectedOptionIndex === question.correct_option_index
}
