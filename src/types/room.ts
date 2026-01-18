import type { Room, Player, RoomStatus } from './database'

export type { Room, RoomStatus }

export interface RoomWithPlayers extends Room {
  players: Player[]
}

export interface LobbyRoom extends Room {
  player_count: number;
  host_nickname: string;
}
