import { memo } from "react";
import type { Player } from "../types";
import { isPlayerOnline } from "../utils/presence";

interface ScoreBoardProps {
  players: Player[];
  currentPlayerId?: string;
  nowMs?: number;
}

export const ScoreBoard = memo(function ScoreBoard({
  players,
  currentPlayerId,
  nowMs,
}: ScoreBoardProps) {
  const effectiveNowMs = nowMs ?? Date.now();
  return (
    <div className="flex justify-center gap-4">
      {players.map((player) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        return (
          <div
            key={player.id}
            className={`
              flex items-center gap-3 px-4 py-2 rounded-xl
              ${isCurrentPlayer ? "bg-yellow-400/20 border border-yellow-400/50" : "bg-white/10"}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
              {player.nickname.charAt(0).toUpperCase()}
            </div>
            <div className="text-white">
              <p className="text-sm font-medium flex items-center gap-2">
                {player.nickname}
                {isPlayerOnline(player, effectiveNowMs) ? (
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                )}
              </p>
              <p className="text-xs text-white/60">
                {player.current_question_index}/10 · {player.score} pts
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
