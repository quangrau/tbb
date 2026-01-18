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
              flex items-center gap-3 px-4 py-2 rounded-bb-lg border-3 border-bb-ink
              ${isCurrentPlayer ? "bg-bb-secondary" : "bg-bb-surface"}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-bb-primary flex items-center justify-center text-white font-bold text-sm border-3 border-bb-ink">
              {player.nickname.charAt(0).toUpperCase()}
            </div>
            <div className="text-bb-ink">
              <p className="text-sm font-bold flex items-center gap-2">
                {player.nickname}
                {isPlayerOnline(player, effectiveNowMs) ? (
                  <span className="w-2 h-2 rounded-full bg-bb-primary" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-bb-danger" />
                )}
              </p>
              <p className="text-xs text-bb-muted font-bold">
                {player.current_question_index}/10 · {player.score} pts
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
