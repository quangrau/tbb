import type { Question } from './database'

export type { Question }

export interface QuestionWithIndex extends Question {
  index: number
}
