import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { RoomCard } from "../components/RoomCard";
import { Navbar } from "../components/Navbar";
import { useLobbyStore } from "../stores/lobbyStore";
import { useRoomStore } from "../stores/roomStore";
import { useDeviceId } from "../hooks/useDeviceId";
import { GRADE_OPTIONS, ROUTES } from "../utils/constants";
import { getLastNickname } from "../utils/joinFormPrefs";

export default function LobbyPage() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();

  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);

  const { rooms, isLoading, gradeFilter, setGradeFilter, subscribe } =
    useLobbyStore(
      useShallow((state) => ({
        rooms: state.rooms,
        isLoading: state.isLoading,
        gradeFilter: state.gradeFilter,
        setGradeFilter: state.setGradeFilter,
        subscribe: state.subscribe,
      })),
    );

  const { joinRoomById, error: roomError } = useRoomStore(
    useShallow((state) => ({
      joinRoomById: state.joinRoomById,
      error: state.error,
    })),
  );

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const handleJoinRoom = async (roomId: string) => {
    const nickname = getLastNickname();
    if (!nickname) {
      // Navbar should handle this, but just in case
      return;
    }

    setJoiningRoomId(roomId);

    try {
      await joinRoomById(roomId, deviceId, nickname);
      navigate(ROUTES.waiting);
    } catch {
      setJoiningRoomId(null);
    }
  };

  const gradeFilterOptions = [
    { value: null, label: "All" },
    ...GRADE_OPTIONS,
  ];

  const chipBase =
    "px-3 py-1.5 rounded-bb-lg border-2 border-bb-ink font-bold text-sm transition-colors cursor-pointer";
  const chipSelected = "bg-bb-secondary text-bb-ink";
  const chipUnselected = "bg-bb-surface hover:bg-bb-secondaryHover text-bb-ink";

  return (
    <div className="min-h-screen flex flex-col bg-bb-bg">
      <Navbar />

      <div className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold font-display text-bb-ink mb-4">
            Find a Game
          </h1>

          {roomError && (
            <p className="text-bb-danger text-sm font-bold mb-4">{roomError}</p>
          )}

          {/* Grade filter chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {gradeFilterOptions.map((option) => (
              <button
                key={option.value ?? "all"}
                onClick={() => setGradeFilter(option.value)}
                className={`${chipBase} ${
                  gradeFilter === option.value ? chipSelected : chipUnselected
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Room list */}
          <div className="space-y-3">
            {isLoading && rooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-bb-muted font-bold">Loading games...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 bg-bb-surface border-3 border-bb-ink rounded-bb-lg">
                <p className="text-bb-muted font-bold">
                  No public games available
                </p>
                <p className="text-bb-muted text-sm mt-1">
                  Check back later or create your own!
                </p>
              </div>
            ) : (
              rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={handleJoinRoom}
                  isJoining={joiningRoomId === room.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
