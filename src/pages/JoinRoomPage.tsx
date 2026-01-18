import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useRoomStore } from "../stores/roomStore";
import { useDeviceId } from "../hooks/useDeviceId";
import { getActiveRoomCode, getActiveRoomId } from "../utils/activeRoom";
import { getLastNickname, setLastNickname } from "../utils/joinFormPrefs";
import {
  NICKNAME_MAX_LENGTH,
  ROOM_CODE_LENGTH,
  ROUTES,
} from "../utils/constants";

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
  const [nickname, setNickname] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const cachedCode = getActiveRoomCode();
    if (cachedCode) {
      const cleaned = cachedCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setCode(cleaned.slice(0, ROOM_CODE_LENGTH));
    }
    const cachedNickname = getLastNickname();
    if (cachedNickname) {
      setNickname(cachedNickname.slice(0, NICKNAME_MAX_LENGTH));
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
    // Only allow alphanumeric, convert to uppercase
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const next = cleaned.slice(0, ROOM_CODE_LENGTH);
    setCode(next);
  };

  const handleJoin = async () => {
    const trimmedNickname = nickname.trim();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setLocalError("Please enter a room code");
      return;
    }
    if (trimmedCode.length !== ROOM_CODE_LENGTH) {
      setLocalError(`Room code must be ${ROOM_CODE_LENGTH} characters`);
      return;
    }
    if (!trimmedNickname) {
      setLocalError("Please enter a nickname");
      return;
    }
    if (trimmedNickname.length > NICKNAME_MAX_LENGTH) {
      setLocalError(
        `Nickname must be ${NICKNAME_MAX_LENGTH} characters or less`,
      );
      return;
    }

    setLocalError("");
    try {
      setLastNickname(trimmedNickname);
      await joinRoom(trimmedCode, deviceId, trimmedNickname);
      navigate(ROUTES.waiting);
    } catch {
      // Error is handled by store
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-bb-ink mb-2">
            Join Room
          </h1>
          <p className="text-bb-muted font-bold">
            Enter the room code from your friend
          </p>
        </div>

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

          <Input
            label="Your Nickname"
            placeholder="Enter your name"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setLastNickname(e.target.value);
            }}
            maxLength={NICKNAME_MAX_LENGTH}
          />

          {(localError || error) && (
            <p className="text-bb-danger text-sm text-center font-bold">
              {localError || error}
            </p>
          )}

          <div className="space-y-3 pt-2">
            <Button
              fullWidth
              size="lg"
              onClick={handleJoin}
              disabled={isLoading || code.length !== ROOM_CODE_LENGTH}
            >
              {isLoading ? "Joining..." : "Join Room"}
            </Button>

            <Button
              fullWidth
              variant="outline"
              onClick={() => navigate(ROUTES.home)}
            >
              Back
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
