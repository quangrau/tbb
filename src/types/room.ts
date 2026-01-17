import type { Room, Player, RoomStatus } from './database'

export type { Room, RoomStatus }

export interface RoomWithPlayers extends Room {
  players: Player[]
}
