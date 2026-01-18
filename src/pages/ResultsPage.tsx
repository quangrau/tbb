import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useDeviceId } from "../hooks/useDeviceId";
import { useRoomStore } from "../stores/roomStore";
import { useGameStore } from "../stores/gameStore";
import type { Player } from "../types";
import {
  fetchRoomResultsWithDerivedStats,
  type PlayerPostGameStats,
} from "../services/gameService";
import { getActiveRoomCode, getActiveRoomId } from "../utils/activeRoom";
import { useNow } from "../hooks/useNow";
import { isPlayerOnline } from "../utils/presence";
import {
  PRESENCE_POLL_INTERVAL_MS,
  ROOM_STATUS,
  ROUTES,
} from "../utils/constants";

function formatTimeMs(totalTimeMs: number): string {
  const seconds = Math.round(totalTimeMs / 1000);
  return `${seconds}s`;
}

function winnerLabel(
  players: Array<Player & { stats: PlayerPostGameStats }>,
): string | null {
  if (players.length === 0) return null;
  const best = players[0];
  const tied = players.filter(
    (p) => p.score === best.score && p.total_time_ms === best.total_time_ms,
  );
  if (tied.length > 1) return "Draw";
  return `${best.nickname} wins`;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const nowMs = useNow(PRESENCE_POLL_INTERVAL_MS);
  const hasAttemptedRestoreRef = useRef(false);

  const {
    room,
    currentPlayer,
    isRoomLoading,
    loadRoom,
    joinRoom,
    startReplay,
    resetRoomStore,
  } = useRoomStore(
    useShallow((state) => ({
      room: state.room,
      currentPlayer: state.currentPlayer,
      isRoomLoading: state.isLoading,
      loadRoom: state.loadRoom,
      joinRoom: state.joinRoom,
      startReplay: state.startReplay,
      resetRoomStore: state.reset,
    })),
  );

  const { resetGameStore } = useGameStore(
    useShallow((state) => ({
      resetGameStore: state.reset,
    })),
  );

  const [results, setResults] = useState<
    Array<Player & { stats: PlayerPostGameStats }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (room?.status === ROOM_STATUS.WAITING) {
      resetGameStore();
      navigate(ROUTES.waiting);
    }
  }, [room?.status, navigate, resetGameStore]);

  useEffect(() => {
    if (!room || !currentPlayer) {
      if (isRoomLoading) return;
      const activeRoomId = getActiveRoomId();
      if (activeRoomId && !hasAttemptedRestoreRef.current) {
        hasAttemptedRestoreRef.current = true;
        loadRoom(activeRoomId, deviceId).catch(() => {
          const activeRoomCode = getActiveRoomCode();
          if (!activeRoomCode) {
            navigate(ROUTES.home);
            return;
          }
          joinRoom(activeRoomCode, deviceId, "Rejoin").catch(() => {
            navigate(ROUTES.home);
          });
        });
        return;
      }
      navigate(ROUTES.home);
      return;
    }

    fetchRoomResultsWithDerivedStats(room.id)
      .then((players) => {
        setResults(players);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load results");
      });
  }, [
    room,
    currentPlayer,
    isRoomLoading,
    loadRoom,
    joinRoom,
    deviceId,
    navigate,
  ]);

  const handleExit = () => {
    resetGameStore();
    resetRoomStore();
    navigate(ROUTES.home);
  };

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-bb-muted text-xl font-bold">Loading results...</p>
      </div>
    );
  }

  const currentPlayerStats =
    results.find((p) => p.id === currentPlayer.id)?.stats ?? null;
  const header = winnerLabel(results);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-bb-ink mb-2">
            Results
          </h1>
          <p className="text-bb-muted font-bold">Room {room.code}</p>
          {header && <p className="text-bb-ink mt-2 font-bold">{header}</p>}
        </div>

        <Card className="w-full space-y-4">
          {error && (
            <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-3 text-center">
              <p className="text-bb-danger text-sm font-bold">{error}</p>
            </div>
          )}

          {currentPlayerStats && (
            <div className="bg-bb-secondary border-3 border-bb-ink rounded-bb-lg p-4">
              <p className="text-bb-ink font-bold mb-1">Your summary</p>
              <p className="text-bb-ink text-sm font-bold">
                Accuracy {currentPlayerStats.accuracyPercent}% ·{" "}
                {currentPlayerStats.wrongCount} wrong ·{" "}
                {currentPlayerStats.timeoutCount} timeout
              </p>
            </div>
          )}

          <div className="space-y-2">
            {results.map((player, index) => {
              const isYou = player.id === currentPlayer.id;
              const isOnline = isPlayerOnline(player, nowMs);
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-bb-lg border-3 border-bb-ink ${
                    isYou ? "bg-bb-secondary" : "bg-bb-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bb-primary flex items-center justify-center text-white font-bold border-3 border-bb-ink">
                      {player.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-bb-ink font-bold flex items-center gap-2">
                        <span>
                          #{index + 1} {player.nickname}
                          {isYou && (
                            <span className="text-bb-ink text-xs ml-2">
                              (You)
                            </span>
                          )}
                        </span>
                        {isOnline ? (
                          <span className="w-2 h-2 rounded-full bg-bb-primary" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-bb-danger" />
                        )}
                      </p>
                      <p className="text-bb-muted text-sm font-bold">
                        {player.score} pts ·{" "}
                        {formatTimeMs(player.total_time_ms)} ·{" "}
                        {player.stats.accuracyPercent}% ·{" "}
                        {player.stats.timeoutCount} timeout
                      </p>
                      <p className="text-bb-muted text-xs font-bold">
                        {player.is_finished ? "Finished" : "Not finished"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 space-y-3">
            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={() => navigate(ROUTES.review)}
            >
              Review Mistakes
            </Button>
            {currentPlayer.is_owner ? (
              <Button
                fullWidth
                size="lg"
                variant="primary"
                onClick={() => startReplay()}
              >
                Play Again
              </Button>
            ) : (
              <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-4 text-center">
                <p className="text-bb-muted font-bold animate-pulse">
                  Waiting for host to start another round...
                </p>
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={handleExit}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
