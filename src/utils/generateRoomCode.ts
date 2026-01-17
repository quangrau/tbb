import { ROOM_CODE_CHARS, ROOM_CODE_LENGTH } from './constants'

/**
 * Generates a random 6-character room code
 * Uses only unambiguous characters (no 0/O, 1/I/L)
 */
export function generateRoomCode(): string {
  return Array.from({ length: ROOM_CODE_LENGTH }, () =>
    ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  ).join('')
}
