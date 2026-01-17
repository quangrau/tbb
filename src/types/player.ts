import type { Player } from './database'

export type { Player }

export interface PlayerRanking extends Player {
  rank: number
}
