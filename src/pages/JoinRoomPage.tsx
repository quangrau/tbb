import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Navbar } from "../components/Navbar";
import { useRoomStore } from "../stores/roomStore";
import { useDeviceId } from "../hooks/useDeviceId";
import { getActiveRoomCode, getActiveRoomId } from "../utils/activeRoom";
import { getLastNickname } from "../utils/joinFormPrefs";
import { ROOM_CODE_LENGTH, ROUTES } from "../utils/constants";

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const { joinRoom, isLoading, error } = useRoomStore(
    useShallow((state) => ({
      joinRoom: state.joinRoom,
      isLoading: state.isLoading,
      error: state.error,
    })),
  );

  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const cachedCode = getActiveRoomCode();
    if (cachedCode) {
      const cleaned = cachedCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setCode(cleaned.slice(0, ROOM_CODE_LENGTH));
    }
  }, []);

  useEffect(() => {
    const attemptRestore = () => {
      if (!navigator.onLine) return;
      const activeRoomId = getActiveRoomId();
      if (!activeRoomId) return;
      navigate(ROUTES.waiting);
    };

    attemptRestore();
    window.addEventListener("online", attemptRestore);
    return () => window.removeEventListener("online", attemptRestore);
  }, [navigate]);

  const handleCodeChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const next = cleaned.slice(0, ROOM_CODE_LENGTH);
    setCode(next);
  };

  const handleJoin = async () => {
    const nickname = getLastNickname();
    if (!nickname) {
      // Navbar should handle this, but just in case
      return;
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setLocalError("Please enter a room code");
      return;
    }
    if (trimmedCode.length !== ROOM_CODE_LENGTH) {
      setLocalError(`Room code must be ${ROOM_CODE_LENGTH} characters`);
      return;
    }

    setLocalError("");
    try {
      await joinRoom(trimmedCode, deviceId, nickname);
      navigate(ROUTES.waiting);
    } catch {
      // Error is handled by store
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bb-bg">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold font-display text-bb-ink mb-4">
            Join with Code
          </h1>

          <Card className="w-full space-y-6">
            <div>
              <label className="block text-bb-ink text-sm font-bold mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="XXXXXX"
                maxLength={ROOM_CODE_LENGTH}
                autoFocus
                className="w-full px-4 py-4 bg-bb-surface border-3 border-bb-ink rounded-bb-lg text-bb-ink text-center text-2xl font-mono tracking-[0.3em] placeholder:text-bb-muted focus-visible:outline-none transition-colors uppercase"
              />
            </div>

            {(localError || error) && (
              <p className="text-bb-danger text-sm text-center font-bold">
                {localError || error}
              </p>
            )}

            <div className="pt-2">
              <Button
                fullWidth
                size="lg"
                onClick={handleJoin}
                disabled={isLoading || code.length !== ROOM_CODE_LENGTH}
              >
                {isLoading ? "Joining..." : "Join Room"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
