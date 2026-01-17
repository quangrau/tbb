import type { Player } from '../types'

export const ONLINE_THRESHOLD_MS = 45_000

export function isPlayerOnline(
  player: Player,
  nowMs: number,
  thresholdMs: number = ONLINE_THRESHOLD_MS
): boolean {
  const heartbeatMs = Date.parse(player.last_heartbeat)
  if (!Number.isFinite(heartbeatMs)) return false
  return nowMs - heartbeatMs <= thresholdMs
}

