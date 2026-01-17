import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useDeviceId } from "../hooks/useDeviceId";
import { useRoomStore } from "../stores/roomStore";
import { useGameStore } from "../stores/gameStore";
import type { Player } from "../types";
import { fetchRoomResults } from "../services/gameService";
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

  const [results, setResults] = useState<Player[]>([]);
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

    fetchRoomResults(room.id)
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
        <p className="text-white text-xl">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Results
        </h1>
        <p className="text-white/70">Room {room.code}</p>
      </div>

      <Card className="w-full max-w-md space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-center">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          {results.map((player, index) => {
            const isYou = player.id === currentPlayer.id;
            const isOnline = isPlayerOnline(player, nowMs);
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isYou
                    ? "bg-yellow-400/20 border border-yellow-400/50"
                    : "bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    {player.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      <span>
                        #{index + 1} {player.nickname}
                        {isYou && (
                          <span className="text-yellow-400 text-xs ml-2">
                            (You)
                          </span>
                        )}
                      </span>
                      {isOnline ? (
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                      )}
                    </p>
                    <p className="text-white/60 text-sm">
                      {player.score} pts · {formatTimeMs(player.total_time_ms)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 space-y-3">
          {currentPlayer.is_owner ? (
            <Button
              fullWidth
              size="lg"
              variant="primary"
              onClick={() => startReplay()}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Play Again
            </Button>
          ) : (
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white/80 animate-pulse">
                Waiting for host to start another round...
              </p>
            </div>
          )}

          <Button fullWidth size="lg" variant="secondary" onClick={handleExit}>
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
