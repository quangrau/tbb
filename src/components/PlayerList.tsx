import { memo } from "react";
import type { Player } from "../types";
import { isPlayerOnline } from "../utils/presence";

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
  maxPlayers: number;
  nowMs?: number;
}

export const PlayerList = memo(function PlayerList({
  players,
  currentPlayerId,
  maxPlayers,
  nowMs,
}: PlayerListProps) {
  const emptySlots = maxPlayers - players.length;
  const effectiveNowMs = nowMs ?? Date.now();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-bb-muted text-sm font-bold">
        <span>Players</span>
        <span>
          {players.length}/{maxPlayers}
        </span>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-bb-lg border-3 border-bb-ink ${
              player.id === currentPlayerId
                ? "bg-bb-secondary"
                : "bg-bb-surface"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bb-primary flex items-center justify-center text-white font-bold border-3 border-bb-ink">
                {player.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-bb-ink font-bold">
                  {player.nickname}
                  {player.id === currentPlayerId && (
                    <span className="text-bb-ink text-xs ml-2">(You)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPlayerOnline(player, effectiveNowMs) ? (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-bb-primary text-white">
                  Online
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-bb-surface text-bb-danger">
                  Offline
                </span>
              )}

              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  player.is_ready
                    ? "bg-bb-primary text-white"
                    : "bg-bb-surface text-bb-muted"
                }`}
              >
                {player.is_ready ? "Ready" : "Waiting"}
              </span>
            </div>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center justify-center p-3 rounded-bb-lg bg-bb-surface border-3 border-dashed border-bb-ink"
          >
            <p className="text-bb-muted font-bold">Waiting for player...</p>
          </div>
        ))}
      </div>
    </div>
  );
});
