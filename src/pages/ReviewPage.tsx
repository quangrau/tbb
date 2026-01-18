import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ReviewQuestionItem } from "../components/ReviewQuestionItem.tsx";
import { useDeviceId } from "../hooks/useDeviceId";
import { fetchPlayerReviewItemsForAllQuestions } from "../services/gameService";
import { submitQuestionReport } from "../services/reportService.ts";
import { useRoomStore } from "../stores/roomStore";
import type { AnswerWithQuestion, ReportPayload } from "../types/review.ts";
import { getActiveRoomCode, getActiveRoomId } from "../utils/activeRoom";
import { REPORT_TYPE, REVIEW_FILTER, ROUTES } from "../utils/constants";

type ReviewFilter = (typeof REVIEW_FILTER)[keyof typeof REVIEW_FILTER];

function filterLabel(filter: ReviewFilter): string {
  switch (filter) {
    case REVIEW_FILTER.ALL:
      return "All";
    case REVIEW_FILTER.REVIEW:
      return "To review";
    default:
      return "All";
  }
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const hasAttemptedRestoreRef = useRef(false);

  const { room, currentPlayer, isRoomLoading, loadRoom, joinRoom } =
    useRoomStore(
      useShallow((state) => ({
        room: state.room,
        currentPlayer: state.currentPlayer,
        isRoomLoading: state.isLoading,
        loadRoom: state.loadRoom,
        joinRoom: state.joinRoom,
      })),
    );

  const [filter, setFilter] = useState<ReviewFilter>(REVIEW_FILTER.ALL);
  const [items, setItems] = useState<AnswerWithQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportedAnswerIdSet, setReportedAnswerIdSet] = useState<Set<string>>(
    () => new Set(),
  );

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

    setIsLoading(true);
    fetchPlayerReviewItemsForAllQuestions({
      roomId: room.id,
      playerId: currentPlayer.id,
      questionIds: room.question_ids,
      timePerQuestionSec: room.time_per_question_sec,
    })
      .then((data: AnswerWithQuestion[]) => {
        setItems(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load review");
      })
      .finally(() => setIsLoading(false));
  }, [
    room,
    currentPlayer,
    isRoomLoading,
    loadRoom,
    joinRoom,
    deviceId,
    navigate,
  ]);

  const filteredItems = useMemo(() => {
    if (filter === REVIEW_FILTER.ALL) return items;
    if (filter === REVIEW_FILTER.REVIEW)
      return items.filter((item) => !item.answer.is_correct);
    return items;
  }, [filter, items]);

  const toReviewCount = useMemo(() => {
    let count = 0;
    for (const item of items) {
      if (!item.answer.is_correct) count += 1;
    }
    return count;
  }, [items]);

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-bb-muted text-xl font-bold">Loading review...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-bb-ink mb-2">
            Review
          </h1>
          <p className="text-bb-muted font-bold">Room {room.code}</p>
        </div>

        <Card className="w-full space-y-4">
          {error && (
            <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-3 text-center">
              <p className="text-bb-danger text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="text-bb-muted text-sm font-bold">
              {isLoading ? "Loading..." : `${toReviewCount} to review`}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.results)}
            >
              Back to Results
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[REVIEW_FILTER.ALL, REVIEW_FILTER.REVIEW].map((value) => (
              <Button
                key={value}
                variant={filter === value ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter(value)}
              >
                {filterLabel(value)}
              </Button>
            ))}
          </div>

          {!isLoading && items.length > 0 && filteredItems.length === 0 && (
            <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-4 text-center">
              <p className="text-bb-muted font-bold">
                No questions in this filter.
              </p>
            </div>
          )}

          {!isLoading && items.length > 0 && toReviewCount === 0 && (
            <div className="bg-bb-primary border-3 border-bb-ink rounded-bb-lg p-4 text-center">
              <p className="text-white font-bold">All correct!</p>
              <p className="text-white text-sm font-bold opacity-90">
                Great job — nothing to review this round.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <ReviewQuestionItem
                key={item.answer.id}
                index={index}
                item={item}
                isReported={reportedAnswerIdSet.has(item.answer.id)}
                onReport={async ({ reportType, reportText }: ReportPayload) => {
                  await submitQuestionReport({
                    questionId: item.question.id,
                    roomId: room.id,
                    playerId: currentPlayer.id,
                    reportType,
                    reportText,
                    selectedOptionIndex: item.answer.selected_option_index,
                    answerText: item.answer.answer_text,
                  });
                  setReportedAnswerIdSet((previous) => {
                    const next = new Set(previous);
                    next.add(item.answer.id);
                    return next;
                  });
                }}
                reportTypes={[
                  REPORT_TYPE.INCORRECT_ANSWER,
                  REPORT_TYPE.INCORRECT_EXPLANATION,
                  REPORT_TYPE.TYPO_FORMATTING,
                  REPORT_TYPE.AMBIGUOUS,
                  REPORT_TYPE.OTHER,
                ]}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
