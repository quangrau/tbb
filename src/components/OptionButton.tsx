import { memo, useCallback } from 'react'

interface OptionButtonProps {
  label: string
  index: number
  onSelectOption: (index: number) => void
  disabled?: boolean
  selected?: boolean
  isCorrect?: boolean | null
  showResult?: boolean
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export const OptionButton = memo(function OptionButton({
  label,
  index,
  onSelectOption,
  disabled = false,
  selected = false,
  isCorrect = null,
  showResult = false,
}: OptionButtonProps) {
  let bgColor = 'bg-white/20 hover:bg-white/30'
  let borderColor = 'border-white/30'
  let textColor = 'text-white'

  const handleClick = useCallback(() => {
    onSelectOption(index)
  }, [index, onSelectOption])

  if (showResult) {
    if (isCorrect === true) {
      bgColor = 'bg-green-500/30'
      borderColor = 'border-green-400'
      textColor = 'text-green-200'
    } else if (isCorrect === false && selected) {
      bgColor = 'bg-red-500/30'
      borderColor = 'border-red-400'
      textColor = 'text-red-200'
    }
  } else if (selected) {
    bgColor = 'bg-yellow-400/30'
    borderColor = 'border-yellow-400'
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full p-4 rounded-xl border-2 transition-all duration-200
        flex items-center gap-4 text-left
        ${bgColor} ${borderColor} ${textColor}
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
          ${selected || (showResult && isCorrect) ? 'bg-white/30' : 'bg-white/10'}
        `}
      >
        {OPTION_LETTERS[index]}
      </span>
      <span className="text-lg font-medium flex-1">{label}</span>
    </button>
  )
})
