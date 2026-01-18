import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Navbar } from "../components/Navbar";
import { useRoomStore } from "../stores/roomStore";
import { useDeviceId } from "../hooks/useDeviceId";
import {
  GRADE_OPTIONS,
  QUESTIONS_COUNT_OPTIONS,
  TIME_PER_QUESTION_OPTIONS,
  MAX_PLAYERS_OPTIONS,
  DEFAULT_QUESTIONS_COUNT,
  DEFAULT_TIME_PER_QUESTION_SEC,
  DEFAULT_MAX_PLAYERS,
} from "../utils/constants";
import { getLastNickname } from "../utils/joinFormPrefs";

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const { createRoom, isLoading, error } = useRoomStore(
    useShallow((state) => ({
      createRoom: state.createRoom,
      isLoading: state.isLoading,
      error: state.error,
    })),
  );

  const [grade, setGrade] = useState(3);
  const term = 0;

  // Room visibility
  const [isPublic, setIsPublic] = useState(true);
  const [roomName, setRoomName] = useState("");

  // Challenge settings (collapsed by default)
  const [showSettings, setShowSettings] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(DEFAULT_QUESTIONS_COUNT);
  const [timePerQuestion, setTimePerQuestion] = useState(
    DEFAULT_TIME_PER_QUESTION_SEC,
  );
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS);

  const optionBase =
    "px-2 py-3 rounded-bb-lg border-3 border-bb-ink font-bold transition-colors cursor-pointer";
  const optionSelected = "bg-bb-secondary text-bb-ink";
  const optionUnselected =
    "bg-bb-surface hover:bg-bb-secondaryHover text-bb-ink";

  const handleCreate = async () => {
    const nickname = getLastNickname();
    if (!nickname) {
      // Navbar should handle this, but just in case
      return;
    }

    try {
      await createRoom(grade, term, deviceId, nickname, {
        questionsCount,
        timePerQuestionSec: timePerQuestion,
        maxPlayers,
        isPublic,
        name: roomName.trim() || undefined,
      });
      navigate("/waiting");
    } catch {
      // Error is handled by store
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bb-bg">
      <Navbar />

      <div className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold font-display text-bb-ink mb-4">
            Create Room
          </h1>

          <Card className="w-full space-y-6">
            <div>
              <label className="block text-bb-ink text-sm font-bold mb-2">
                Grade Level
              </label>
              <div className="grid grid-cols-6 gap-2">
                {GRADE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGrade(option.value)}
                    className={`${optionBase} ${
                      grade === option.value ? optionSelected : optionUnselected
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Room visibility toggle */}
            <div>
              <label className="block text-bb-ink text-sm font-bold mb-2">
                Room Visibility
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsPublic(true)}
                  className={`${optionBase} ${
                    isPublic ? optionSelected : optionUnselected
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setIsPublic(false)}
                  className={`${optionBase} ${
                    !isPublic ? optionSelected : optionUnselected
                  }`}
                >
                  Private
                </button>
              </div>
              <p className="text-bb-muted text-xs mt-2">
                {isPublic
                  ? "Anyone can find and join from the lobby"
                  : "Only players with the room code can join"}
              </p>
            </div>

            {/* Optional room name */}
            <Input
              label="Room Name (optional)"
              placeholder="Auto-generated if empty"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={100}
            />

            {/* Collapsible Challenge Settings */}
            <div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-bb-ink text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span className="text-lg">{showSettings ? "▾" : "▸"}</span>
                Challenge Settings
              </button>

              {showSettings && (
                <div className="mt-3 p-4 bg-bb-surface border-3 border-bb-ink rounded-bb-lg space-y-4">
                  {/* Questions count */}
                  <div>
                    <label className="block text-bb-muted text-xs font-bold mb-2">
                      Questions
                    </label>
                    <div className="flex gap-2">
                      {QUESTIONS_COUNT_OPTIONS.map((count) => (
                        <button
                          key={count}
                          onClick={() => setQuestionsCount(count)}
                          className={`flex-1 px-2 py-2 rounded-bb-lg border-3 border-bb-ink text-sm font-bold transition-colors cursor-pointer ${
                            questionsCount === count
                              ? optionSelected
                              : optionUnselected
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time per question */}
                  <div>
                    <label className="block text-bb-muted text-xs font-bold mb-2">
                      Time per Question (seconds)
                    </label>
                    <div className="flex gap-2">
                      {TIME_PER_QUESTION_OPTIONS.map((time) => (
                        <button
                          key={time}
                          onClick={() => setTimePerQuestion(time)}
                          className={`flex-1 px-2 py-2 rounded-bb-lg border-3 border-bb-ink text-sm font-bold transition-colors cursor-pointer ${
                            timePerQuestion === time
                              ? optionSelected
                              : optionUnselected
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max players */}
                  <div>
                    <label className="block text-bb-muted text-xs font-bold mb-2">
                      Max Players
                    </label>
                    <div className="flex gap-2">
                      {MAX_PLAYERS_OPTIONS.map((count) => (
                        <button
                          key={count}
                          onClick={() => setMaxPlayers(count)}
                          className={`flex-1 px-2 py-2 rounded-bb-lg border-3 border-bb-ink text-sm font-bold transition-colors cursor-pointer ${
                            maxPlayers === count
                              ? optionSelected
                              : optionUnselected
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-bb-danger text-sm text-center font-bold">
                {error}
              </p>
            )}

            <div className="pt-2">
              <Button
                fullWidth
                size="lg"
                onClick={handleCreate}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
