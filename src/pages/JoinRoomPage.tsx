import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useRoomStore } from "../stores/roomStore";
import { useDeviceId } from "../hooks/useDeviceId";
import { getActiveRoomCode, setActiveRoomCode } from "../utils/activeRoom";
import { getLastNickname, setLastNickname } from "../utils/joinFormPrefs";

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
      setCode(cleaned.slice(0, 6));
    }
    const cachedNickname = getLastNickname();
    if (cachedNickname) {
      setNickname(cachedNickname.slice(0, 20));
    }
  }, []);

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric, convert to uppercase
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const next = cleaned.slice(0, 6);
    setCode(next);
  };

  const handleJoin = async () => {
    const trimmedNickname = nickname.trim();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setLocalError("Please enter a room code");
      return;
    }
    if (trimmedCode.length !== 6) {
      setLocalError("Room code must be 6 characters");
      return;
    }
    if (!trimmedNickname) {
      setLocalError("Please enter a nickname");
      return;
    }
    if (trimmedNickname.length > 20) {
      setLocalError("Nickname must be 20 characters or less");
      return;
    }

    setLocalError("");
    try {
      setActiveRoomCode(trimmedCode);
      setLastNickname(trimmedNickname);
      await joinRoom(trimmedCode, deviceId, trimmedNickname);
      navigate("/waiting");
    } catch {
      // Error is handled by store
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Join Room
        </h1>
        <p className="text-white/70">Enter the room code from your friend</p>
      </div>

      <Card className="w-full max-w-md space-y-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="XXXXXX"
            maxLength={6}
            autoFocus
            className="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all uppercase"
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
          maxLength={20}
        />

        {(localError || error) && (
          <p className="text-red-300 text-sm text-center">
            {localError || error}
          </p>
        )}

        <div className="space-y-3 pt-2">
          <Button
            fullWidth
            size="lg"
            onClick={handleJoin}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Joining..." : "Join Room"}
          </Button>

          <Button fullWidth variant="outline" onClick={() => navigate("/")}>
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
