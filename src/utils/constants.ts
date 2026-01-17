// Room code characters - excludes ambiguous characters (0/O, 1/I/L)
export const ROOM_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

// Room settings
export const ROOM_CODE_LENGTH = 6
export const DEFAULT_MAX_PLAYERS = 2
export const DEFAULT_QUESTIONS_COUNT = 10
export const DEFAULT_TIME_PER_QUESTION_SEC = 10

// Game settings
export const TIMEOUT_ANSWER_TIME_MS = 10000

// Local storage keys
export const DEVICE_ID_KEY = 'tbb_device_id'

// Grade options (for Singapore Math curriculum)
export const GRADE_OPTIONS = [
  { value: 1, label: 'P1' },
  { value: 2, label: 'P2' },
  { value: 3, label: 'P3' },
  { value: 4, label: 'P4' },
  { value: 5, label: 'P5' },
  { value: 6, label: 'P6' },
]

export const GRADE_LABEL_BY_VALUE = Object.fromEntries(
  GRADE_OPTIONS.map((option) => [option.value, option.label])
) as Record<number, string>

// Term options (0 = All terms)
export const TERM_OPTIONS = [
  { value: 0, label: 'All' },
  { value: 1, label: 'T1' },
  { value: 2, label: 'T2' },
  { value: 3, label: 'T3' },
  { value: 4, label: 'T4' },
]

// Challenge settings options
export const QUESTIONS_COUNT_OPTIONS = [5, 10, 15, 20]
export const TIME_PER_QUESTION_OPTIONS = [5, 10, 15, 20, 30]
export const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6]

export const TERM_LABEL_BY_VALUE = Object.fromEntries(
  TERM_OPTIONS.map((option) => [option.value, option.label])
) as Record<number, string>
