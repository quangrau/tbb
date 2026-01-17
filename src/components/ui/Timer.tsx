interface TimerProps {
  seconds: number
  maxSeconds: number
}

export function Timer({ seconds, maxSeconds }: TimerProps) {
  const percentage = (seconds / maxSeconds) * 100
  const isUrgent = seconds <= 3

  return (
    <div className="relative w-20 h-20">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={isUrgent ? '#ef4444' : '#facc15'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 36}`}
          strokeDashoffset={`${2 * Math.PI * 36 * (1 - percentage / 100)}`}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      {/* Timer text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-2xl font-bold ${
            isUrgent ? 'text-red-400 animate-pulse' : 'text-white'
          }`}
        >
          {seconds}
        </span>
      </div>
    </div>
  )
}
