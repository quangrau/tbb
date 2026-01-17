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
      <div className="flex justify-between items-center text-white/70 text-sm">
        <span>Players</span>
        <span>
          {players.length}/{maxPlayers}
        </span>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-xl ${
              player.id === currentPlayerId
                ? "bg-yellow-400/20 border border-yellow-400/50"
                : "bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                {player.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">
                  {player.nickname}
                  {player.id === currentPlayerId && (
                    <span className="text-yellow-400 text-xs ml-2">(You)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPlayerOnline(player, effectiveNowMs) ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Online
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                  Offline
                </span>
              )}

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player.is_ready
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {player.is_ready ? "Ready" : "Waiting"}
              </span>
            </div>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center justify-center p-3 rounded-xl bg-white/5 border border-dashed border-white/20"
          >
            <p className="text-white/40">Waiting for player...</p>
          </div>
        ))}
      </div>
    </div>
  );
});
