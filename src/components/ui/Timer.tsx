interface TimerProps {
  seconds: number;
  maxSeconds: number;
}

export function Timer({ seconds, maxSeconds }: TimerProps) {
  const safeMaxSeconds = Math.max(1, maxSeconds);
  const clampedSeconds = Math.max(0, Math.min(seconds, safeMaxSeconds));
  const progress = clampedSeconds / safeMaxSeconds;
  const isUrgent = seconds <= 3;
  const size = 80;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative w-20 h-20 rounded-full bg-bb-surface border-3 border-bb-ink">
      <svg
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-bb-line"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={`transition-[stroke-dashoffset,stroke] duration-200 ease-linear ${isUrgent ? "text-bb-danger" : "text-bb-primary"}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-2xl font-bold ${
            isUrgent ? "text-bb-danger animate-pulse" : "text-bb-ink"
          }`}
        >
          {clampedSeconds}
        </span>
      </div>
    </div>
  );
}
