import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerOptions {
  initialSeconds: number
  onTimeout?: () => void
  autoStart?: boolean
}

interface UseTimerReturn {
  secondsLeft: number
  isRunning: boolean
  elapsedMs: number
  start: () => void
  stop: () => void
  reset: () => void
}

/**
 * Custom hook for countdown timer with millisecond precision
 */
export function useTimer({
  initialSeconds,
  onTimeout,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)

  const startTimeRef = useRef<number | null>(null)
  const elapsedMsRef = useRef(0)
  const intervalRef = useRef<number | null>(null)
  const onTimeoutRef = useRef(onTimeout)

  // Keep onTimeout ref updated
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (startTimeRef.current) {
      elapsedMsRef.current = Date.now() - startTimeRef.current
    }
    setIsRunning(false)
  }, [])

  const start = useCallback(() => {
    if (isRunning) return
    startTimeRef.current = Date.now()
    elapsedMsRef.current = 0
    setIsRunning(true)
  }, [isRunning])

  const reset = useCallback(() => {
    stop()
    setSecondsLeft(initialSeconds)
    startTimeRef.current = null
    elapsedMsRef.current = 0
  }, [initialSeconds, stop])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stop()
          elapsedMsRef.current = initialSeconds * 1000
          onTimeoutRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, initialSeconds, stop])

  return {
    secondsLeft,
    isRunning,
    elapsedMs: elapsedMsRef.current || (startTimeRef.current ? Date.now() - startTimeRef.current : 0),
    start,
    stop,
    reset,
  }
}
