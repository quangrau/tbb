import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { RoomCodeDisplay } from "../components/RoomCodeDisplay";
import { PlayerList } from "../components/PlayerList";
import { useRoomStore } from "../stores/roomStore";
import { useDeviceId } from "../hooks/useDeviceId";
import { useNow } from "../hooks/useNow";
import { updatePlayerHeartbeat } from "../services/roomService";
import { getActiveRoomCode, getActiveRoomId } from "../utils/activeRoom";
import {
  GRADE_LABEL_BY_VALUE,
  HEARTBEAT_INTERVAL_MS,
  PRESENCE_POLL_INTERVAL_MS,
  ROOM_STATUS,
  ROUTES,
  TERM_LABEL_BY_VALUE,
} from "../utils/constants";
import { isPlayerOnline } from "../utils/presence";

export default function WaitingRoomPage() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const hasAttemptedRestoreRef = useRef(false);
  const nowMs = useNow(PRESENCE_POLL_INTERVAL_MS);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const previousOnlineByPlayerIdRef = useRef<Record<string, boolean>>({});
  const statusMessageTimeoutRef = useRef<number | null>(null);
  const {
    room,
    players,
    currentPlayer,
    isLoading,
    loadRoom,
    joinRoom,
    setReady,
    startGame,
    leaveRoom,
  } = useRoomStore(
    useShallow((state) => ({
      room: state.room,
      players: state.players,
      currentPlayer: state.currentPlayer,
      isLoading: state.isLoading,
      loadRoom: state.loadRoom,
      joinRoom: state.joinRoom,
      setReady: state.setReady,
      startGame: state.startGame,
      leaveRoom: state.leaveRoom,
    })),
  );
  const currentPlayerId = currentPlayer?.id ?? null;

  // Redirect if no room
  useEffect(() => {
    if (!room && !isLoading) {
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
    }
  }, [room, isLoading, loadRoom, joinRoom, deviceId, navigate]);

  // Navigate to challenge when game starts
  useEffect(() => {
    if (room?.status === ROOM_STATUS.PLAYING) {
      navigate(ROUTES.challenge);
    }
  }, [room?.status, navigate]);

  useEffect(() => {
    if (room?.status === ROOM_STATUS.FINISHED) {
      navigate(ROUTES.results);
    }
  }, [room?.status, navigate]);

  useEffect(() => {
    if (!currentPlayerId) return;

    updatePlayerHeartbeat(currentPlayerId).catch(() => {});
    const id = window.setInterval(() => {
      updatePlayerHeartbeat(currentPlayerId).catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [currentPlayerId]);

  useEffect(() => {
    if (!currentPlayerId) return;

    for (const player of players) {
      if (player.id === currentPlayerId) continue;
      const isOnline = isPlayerOnline(player, nowMs);
      const previous = previousOnlineByPlayerIdRef.current[player.id];
      previousOnlineByPlayerIdRef.current[player.id] = isOnline;

      if (previous === undefined || previous === isOnline) continue;

      setStatusMessage(
        isOnline
          ? `${player.nickname} re-joined`
          : `${player.nickname} disconnected`,
      );
      if (statusMessageTimeoutRef.current) {
        window.clearTimeout(statusMessageTimeoutRef.current);
      }
      statusMessageTimeoutRef.current = window.setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    }
  }, [players, currentPlayerId, nowMs]);

  // Check if all players are ready
  const allPlayersReady =
    players.length >= 2 && players.every((p) => p.is_ready);
  const isRoomFull = room && players.length >= room.max_players;
  const canStartGame = allPlayersReady && currentPlayer?.is_owner;
  const offlineOtherPlayers =
    currentPlayerId === null
      ? []
      : players.filter(
          (p) => p.id !== currentPlayerId && !isPlayerOnline(p, nowMs),
        );

  const handleToggleReady = async () => {
    if (!currentPlayer) return;
    await setReady(!currentPlayer.is_ready);
  };

  const handleStartGame = async () => {
    if (!canStartGame) return;
    await startGame();
  };

  const handleLeave = async () => {
    await leaveRoom();
    navigate(ROUTES.home);
  };

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const gradeLabel = GRADE_LABEL_BY_VALUE[room.grade] || `Grade ${room.grade}`;
  const termLabel = TERM_LABEL_BY_VALUE[room.term] || `Term ${room.term}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Waiting Room
        </h1>
        <p className="text-white/70">
          {gradeLabel} - {termLabel}
        </p>
      </div>

      {(statusMessage || offlineOtherPlayers.length > 0) && (
        <div className="w-full max-w-md space-y-2 mb-4">
          {statusMessage && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
              <p className="text-white text-sm">{statusMessage}</p>
            </div>
          )}
          {offlineOtherPlayers.length > 0 && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-center">
              <p className="text-red-200 text-sm">
                Waiting for{" "}
                {offlineOtherPlayers.map((p) => p.nickname).join(", ")} to
                reconnect…
              </p>
            </div>
          )}
        </div>
      )}

      <Card className="w-full max-w-md space-y-6">
        <RoomCodeDisplay code={room.code} />

        <div className="pt-4">
          <PlayerList
            players={players}
            currentPlayerId={currentPlayer.id}
            maxPlayers={room.max_players}
            nowMs={nowMs}
          />
        </div>

        {!isRoomFull && (
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 text-center">
            <p className="text-blue-200 text-sm">
              Share the room code with your friend to start!
            </p>
          </div>
        )}

        {isRoomFull && !allPlayersReady && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 text-center">
            <p className="text-yellow-200 text-sm">
              All players must be ready to start the challenge
            </p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <Button
            fullWidth
            size="lg"
            variant={currentPlayer.is_ready ? "secondary" : "primary"}
            onClick={handleToggleReady}
            disabled={!isRoomFull}
          >
            {currentPlayer.is_ready ? "Cancel Ready" : "I'm Ready!"}
          </Button>

          {allPlayersReady && (
            <Button
              fullWidth
              size="lg"
              onClick={handleStartGame}
              disabled={!canStartGame}
            >
              {canStartGame ? "Start Challenge!" : "Waiting for host to start…"}
            </Button>
          )}

          <Button fullWidth variant="outline" onClick={handleLeave}>
            Leave Room
          </Button>
        </div>
      </Card>
    </div>
  );
}
