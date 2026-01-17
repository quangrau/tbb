import { memo, useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react'

interface TextAnswerInputProps {
  unit?: string | null
  onSubmit: (answer: string) => void
  disabled?: boolean
  showResult?: boolean
  isCorrect?: boolean | null
  submittedAnswer?: string | null
}

export const TextAnswerInput = memo(function TextAnswerInput({
  unit,
  onSubmit,
  disabled = false,
  showResult = false,
  isCorrect = null,
  submittedAnswer = null,
}: TextAnswerInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed && !disabled) {
      onSubmit(trimmed)
    }
  }, [value, disabled, onSubmit])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  // Determine styles based on result state
  let containerBorderColor = 'border-white/30'
  let inputBgColor = 'bg-white/20'
  let textColor = 'text-white'

  if (showResult) {
    if (isCorrect === true) {
      containerBorderColor = 'border-green-400'
      inputBgColor = 'bg-green-500/30'
      textColor = 'text-green-200'
    } else if (isCorrect === false) {
      containerBorderColor = 'border-red-400'
      inputBgColor = 'bg-red-500/30'
      textColor = 'text-red-200'
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`
          flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
          ${containerBorderColor} ${inputBgColor}
        `}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={showResult && submittedAnswer !== null ? submittedAnswer : value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={unit ? `Enter answer in ${unit}` : 'Type your answer'}
          className={`
            flex-1 bg-transparent border-none outline-none text-xl font-medium
            placeholder-white/50
            ${textColor}
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          autoComplete="off"
        />
        {unit && (
          <span className="text-white/60 text-lg font-medium">
            {unit}
          </span>
        )}
      </div>

      {!showResult && !disabled && (
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={`
            w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
            ${value.trim()
              ? 'bg-yellow-400 text-purple-900 hover:bg-yellow-300 cursor-pointer'
              : 'bg-white/20 text-white/50 cursor-not-allowed'}
          `}
        >
          Submit Answer
        </button>
      )}
    </div>
  )
})
