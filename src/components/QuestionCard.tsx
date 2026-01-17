import { memo, useMemo } from 'react'
import type { Question } from '../types'
import { OptionButton } from './OptionButton'
import { TextAnswerInput } from './TextAnswerInput'
import { MathText } from './MathText'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedOption: number | null
  submittedText: string | null
  onSelectOption: (index: number) => void
  onSubmitText: (answer: string) => void
  disabled?: boolean
  showResult?: boolean
  isCorrect?: boolean | null
}

export const QuestionCard = memo(function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  submittedText,
  onSelectOption,
  onSubmitText,
  disabled = false,
  showResult = false,
  isCorrect = null,
}: QuestionCardProps) {
  const options = useMemo(() => {
    if (!question.options) return []

    if (Array.isArray(question.options)) {
      return question.options.filter((option): option is string => typeof option === 'string')
    }

    if (typeof question.options === 'string') {
      try {
        const parsed: unknown = JSON.parse(question.options)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((option): option is string => typeof option === 'string')
      } catch {
        return []
      }
    }

    return []
  }, [question.options])

  const isFreeForm = question.question_type === 'free_form'

  return (
    <div className="space-y-6">
      {/* Question number */}
      <div className="text-center">
        <span className="text-white/60 text-sm">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <p className="text-2xl md:text-3xl font-bold text-white text-center">
          <MathText text={question.question_text} />
        </p>
      </div>

      {/* Answer input - Multiple choice or Free-form */}
      {isFreeForm ? (
        <TextAnswerInput
          unit={question.answer_unit}
          onSubmit={onSubmitText}
          disabled={disabled}
          showResult={showResult}
          isCorrect={isCorrect}
          submittedAnswer={submittedText}
        />
      ) : (
        <div className="grid gap-3">
          {options.map((option, index) => (
            <OptionButton
              key={index}
              label={option}
              index={index}
              onSelectOption={onSelectOption}
              disabled={disabled}
              selected={selectedOption === index}
              isCorrect={showResult ? index === question.correct_option_index : null}
              showResult={showResult}
            />
          ))}
        </div>
      )}
    </div>
  )
})
