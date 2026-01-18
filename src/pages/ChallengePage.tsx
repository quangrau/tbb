import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Timer } from "../components/ui/Timer";
import { Card } from "../components/ui/Card";
import { QuestionCard } from "../components/QuestionCard";
import { ScoreBoard } from "../components/ScoreBoard";
import { useRoomStore } from "../stores/roomStore";
import { useGameStore } from "../stores/gameStore";
import { useDeviceId } from "../hooks/useDeviceId";
import { useNow } from "../hooks/useNow";
import { updatePlayerHeartbeat } from "../services/roomService";
import { getActiveRoomCode, getActiveRoomId } from "../utils/activeRoom";
import {
  DEFAULT_TIME_PER_QUESTION_SEC,
  HEARTBEAT_INTERVAL_MS,
  PRESENCE_POLL_INTERVAL_MS,
  ROOM_STATUS,
  ROUTES,
} from "../utils/constants";
import { isPlayerOnline } from "../utils/presence";
import {
  forceFinishUnfinishedPlayers,
  markRoomFinished,
} from "../services/gameService";

export default function ChallengePage() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const nowMs = useNow(PRESENCE_POLL_INTERVAL_MS);

  const hasAttemptedRestoreRef = useRef(false);
  const {
    room,
    currentPlayer,
    roomPlayers,
    loadRoom,
    isRoomLoading,
    joinRoom,
  } = useRoomStore(
    useShallow((state) => ({
      room: state.room,
      currentPlayer: state.currentPlayer,
      roomPlayers: state.players,
      loadRoom: state.loadRoom,
      isRoomLoading: state.isLoading,
      joinRoom: state.joinRoom,
    })),
  );

  const {
    questions,
    currentQuestionIndex,
    score,
    isFinished,
    isWaitingForOthers,
    gamePlayers,
    lastAnswerCorrect,
    loadQuestions,
    hydrateFromPlayer,
    submitAnswer,
    nextQuestion,
    finishGame,
    subscribeToProgress,
  } = useGameStore(
    useShallow((state) => ({
      questions: state.questions,
      currentQuestionIndex: state.currentQuestionIndex,
      score: state.score,
      isFinished: state.isFinished,
      isWaitingForOthers: state.isWaitingForOthers,
      gamePlayers: state.players,
      lastAnswerCorrect: state.lastAnswerCorrect,
      loadQuestions: state.loadQuestions,
      hydrateFromPlayer: state.hydrateFromPlayer,
      submitAnswer: state.submitAnswer,
      nextQuestion: state.nextQuestion,
      finishGame: state.finishGame,
      subscribeToProgress: state.subscribeToProgress,
    })),
  );

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submittedText, setSubmittedText] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIME_PER_QUESTION_SEC);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const hasHydratedRef = useRef(false);
  const previousOnlineByPlayerIdRef = useRef<Record<string, boolean>>({});
  const statusMessageTimeoutRef = useRef<number | null>(null);
  const hasTriggeredCutoffRef = useRef(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;
  const players = gamePlayers.length > 0 ? gamePlayers : roomPlayers;
  const currentPlayerId = currentPlayer?.id ?? null;
  const offlineOtherPlayers =
    currentPlayerId === null
      ? []
      : players.filter(
          (p) => p.id !== currentPlayerId && !isPlayerOnline(p, nowMs),
        );

  // Redirect if no room or player
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

    // Load questions if not already loaded
    if (questions.length === 0 && room.question_ids.length > 0) {
      loadQuestions(room.question_ids);
    }

    if (!hasHydratedRef.current && questions.length > 0) {
      hasHydratedRef.current = true;
      hydrateFromPlayer(currentPlayer);
    }

    // Subscribe to other players' progress
    const unsubscribe = subscribeToProgress(room.id);
    return () => unsubscribe();
  }, [
    room,
    currentPlayer,
    isRoomLoading,
    questions.length,
    loadQuestions,
    hydrateFromPlayer,
    subscribeToProgress,
    loadRoom,
    joinRoom,
    deviceId,
    navigate,
  ]);

  // Navigate to results when all players finished
  useEffect(() => {
    if (isFinished && !isWaitingForOthers) {
      navigate(ROUTES.results);
    }
  }, [isFinished, isWaitingForOthers, navigate]);

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

  useEffect(() => {
    const roomId = room?.id;
    const roomStatus = room?.status;
    const startedAt = room?.started_at;
    const questionsCount = room?.questions_count;
    const timePerQuestionSec = room?.time_per_question_sec;

    if (!roomId) return;
    if (roomStatus !== ROOM_STATUS.PLAYING) return;
    if (!startedAt) return;
    if (questionsCount === undefined || timePerQuestionSec === undefined)
      return;

    const startedAtMs = Date.parse(startedAt);
    if (!Number.isFinite(startedAtMs)) return;

    const cutoffMs = questionsCount * timePerQuestionSec * 1000;
    const cutoffAtMs = startedAtMs + cutoffMs;
    if (nowMs < cutoffAtMs) return;
    if (hasTriggeredCutoffRef.current) return;

    hasTriggeredCutoffRef.current = true;
    forceFinishUnfinishedPlayers({
      roomId,
      questionsCount,
      timePerQuestionSec,
    })
      .then(() => markRoomFinished(roomId))
      .catch(() => {});
  }, [room, nowMs]);

  const handleSubmit = useCallback(
    async (
      optionIndex: number | null,
      answerText: string | null,
      source: "user" | "timeout" = "user",
    ) => {
      if (
        !room ||
        !currentPlayer ||
        hasSubmittedRef.current ||
        isSubmittingRef.current
      )
        return;

      if (room.started_at) {
        const startedAtMs = Date.parse(room.started_at);
        if (Number.isFinite(startedAtMs)) {
          const cutoffAtMs =
            startedAtMs +
            room.questions_count * room.time_per_question_sec * 1000;
          if (Date.now() >= cutoffAtMs) {
            return;
          }
        }
      }

      hasSubmittedRef.current = true;
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const answerTimeMs = Math.min(
        Date.now() - startTimeRef.current,
        DEFAULT_TIME_PER_QUESTION_SEC * 1000,
      );

      if (source === "user") {
        setSelectedOption(optionIndex);
        setSubmittedText(answerText);
        setShowResult(true);
      }

      try {
        await submitAnswer(
          room.id,
          currentPlayer.id,
          optionIndex,
          answerText,
          answerTimeMs,
        );
      } catch {
        hasSubmittedRef.current = false;
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setShowResult(false);
        setSelectedOption(null);
        setSubmittedText(null);
        return;
      }

      const advance = async () => {
        if (isLastQuestion) {
          await finishGame(room.id, currentPlayer.id);
        } else {
          nextQuestion();
        }
      };

      if (source === "timeout") {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setShowResult(false);
        setSelectedOption(null);
        setSubmittedText(null);
        await advance();
        return;
      }

      setTimeout(async () => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setShowResult(false);
        setSelectedOption(null);
        setSubmittedText(null);
        await advance();
      }, 1500);
    },
    [
      room,
      currentPlayer,
      isLastQuestion,
      submitAnswer,
      nextQuestion,
      finishGame,
    ],
  );

  // Start timer for current question
  useEffect(() => {
    if (!currentQuestion || showResult || isFinished) return;

    startTimeRef.current = Date.now();
    hasSubmittedRef.current = false;
    setSecondsLeft(DEFAULT_TIME_PER_QUESTION_SEC);

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (!hasSubmittedRef.current) {
            handleSubmit(null, null, "timeout");
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    currentQuestionIndex,
    currentQuestion,
    showResult,
    isFinished,
    handleSubmit,
  ]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (showResult || hasSubmittedRef.current) return;
      handleSubmit(index, null, "user");
    },
    [handleSubmit, showResult],
  );

  const handleSubmitText = useCallback(
    (text: string) => {
      if (showResult || hasSubmittedRef.current) return;
      handleSubmit(null, text, "user");
    },
    [handleSubmit, showResult],
  );

  if (!room || !currentPlayer || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-bb-muted text-xl font-bold">Loading challenge...</p>
      </div>
    );
  }

  if (isWaitingForOthers) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md text-center space-y-6">
          {(statusMessage || offlineOtherPlayers.length > 0) && (
            <div className="space-y-2">
              {statusMessage && (
                <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-3 text-center">
                  <p className="text-bb-ink text-sm font-bold">
                    {statusMessage}
                  </p>
                </div>
              )}
              {offlineOtherPlayers.length > 0 && (
                <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-3 text-center">
                  <p className="text-bb-danger text-sm font-bold">
                    Waiting for{" "}
                    {offlineOtherPlayers.map((p) => p.nickname).join(", ")} to
                    reconnect…
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="w-16 h-16 mx-auto border-4 border-bb-ink border-t-transparent rounded-full animate-spin" />
          <h2 className="text-2xl font-bold font-display text-bb-ink">
            Challenge Complete!
          </h2>
          <p className="text-bb-muted font-bold">
            Your score:{" "}
            <span className="text-bb-ink">
              {score}/{questions.length}
            </span>
          </p>
          <p className="text-bb-muted font-bold">
            Waiting for other players to finish...
          </p>

          <div className="pt-4">
            <ScoreBoard
              players={players}
              currentPlayerId={currentPlayer.id}
              nowMs={nowMs}
            />
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-bb-muted text-xl font-bold">
          No questions available
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg px-4 py-3">
            <p className="text-sm text-bb-muted font-bold">Score</p>
            <p className="text-2xl font-bold font-display text-bb-ink">
              {score}/{currentQuestionIndex}
            </p>
          </div>

          <Timer
            seconds={secondsLeft}
            maxSeconds={DEFAULT_TIME_PER_QUESTION_SEC}
          />

          <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg px-4 py-3 text-right">
            <p className="text-sm text-bb-muted font-bold">Question</p>
            <p className="text-2xl font-bold font-display text-bb-ink">
              {currentQuestionIndex + 1}/{questions.length}
            </p>
          </div>
        </div>

        {(statusMessage || offlineOtherPlayers.length > 0) && (
          <div className="mb-4 space-y-2">
            {statusMessage && (
              <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-3 text-center">
                <p className="text-bb-ink text-sm font-bold">{statusMessage}</p>
              </div>
            )}
            {offlineOtherPlayers.length > 0 && (
              <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-3 text-center">
                <p className="text-bb-danger text-sm font-bold">
                  Waiting for{" "}
                  {offlineOtherPlayers.map((p) => p.nickname).join(", ")} to
                  reconnect…
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <ScoreBoard
            players={players}
            currentPlayerId={currentPlayer.id}
            nowMs={nowMs}
          />
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedOption={selectedOption}
              submittedText={submittedText}
              onSelectOption={handleSelectOption}
              onSubmitText={handleSubmitText}
              disabled={showResult || isSubmitting}
              showResult={showResult}
              isCorrect={lastAnswerCorrect}
            />

            {showResult && (
              <div
                className={`mt-6 text-center text-2xl font-bold font-display ${
                  lastAnswerCorrect ? "text-bb-primary" : "text-bb-danger"
                }`}
              >
                {lastAnswerCorrect ? "Correct!" : "Wrong!"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
