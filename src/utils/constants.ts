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
  { value: 2, label: 'Primary 2' },
  { value: 3, label: 'Primary 3' },
  { value: 4, label: 'Primary 4' },
]

export const GRADE_LABEL_BY_VALUE = Object.fromEntries(
  GRADE_OPTIONS.map((option) => [option.value, option.label])
) as Record<number, string>

// Term options
export const TERM_OPTIONS = [
  { value: 1, label: 'Term 1' },
  { value: 2, label: 'Term 2' },
  { value: 3, label: 'Term 3' },
  { value: 4, label: 'Term 4' },
]

export const TERM_LABEL_BY_VALUE = Object.fromEntries(
  TERM_OPTIONS.map((option) => [option.value, option.label])
) as Record<number, string>
