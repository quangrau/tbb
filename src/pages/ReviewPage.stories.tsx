import { useEffect } from "react";
import type { Player, Room } from "../types";
import { useRoomStore } from "../stores/roomStore";
import { ROOM_STATUS } from "../utils/constants";
import ReviewPage from "./ReviewPage";

function nowIso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function buildRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "sb-room-1",
    code: "ABC123",
    grade: 3,
    term: 0,
    max_players: 2,
    questions_count: 10,
    time_per_question_sec: 10,
    question_ids: ["sb-q-1", "sb-q-2", "sb-q-3", "sb-q-4", "sb-q-5"],
    status: ROOM_STATUS.FINISHED,
    created_at: nowIso(-60_000),
    started_at: nowIso(-50_000),
    finished_at: nowIso(-5_000),
    expires_at: nowIso(60_000),
    ...overrides,
  };
}

function buildPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "sb-player-1",
    room_id: "sb-room-1",
    device_id: "sb-device-1",
    nickname: "Host",
    is_ready: true,
    is_finished: true,
    current_question_index: 10,
    score: 8,
    total_time_ms: 38000,
    joined_at: nowIso(-60_000),
    finished_at: nowIso(-5_000),
    last_heartbeat: nowIso(0),
    is_owner: true,
    ...overrides,
  };
}

function seed(room: Room, currentPlayer: Player) {
  useRoomStore.setState((state) => ({
    ...state,
    room,
    players: [currentPlayer],
    currentPlayer,
    isLoading: false,
    error: null,
  }));
}

export default {
  title: "Screens/Review",
  component: ReviewPage,
};

function MixedStory() {
  useEffect(() => {
    const room = buildRoom();
    seed(room, buildPlayer({ room_id: room.id }));
  }, []);
  return <ReviewPage />;
}

export const Mixed = {
  render: () => <MixedStory />,
};

function AllCorrectStory() {
  useEffect(() => {
    const room = buildRoom({ id: "sb-room-review-all-correct" });
    seed(room, buildPlayer({ room_id: room.id }));
  }, []);
  return <ReviewPage />;
}

export const AllCorrect = {
  render: () => <AllCorrectStory />,
};

function EmptyStory() {
  useEffect(() => {
    const room = buildRoom({ id: "sb-room-review-empty" });
    seed(room, buildPlayer({ room_id: room.id }));
  }, []);
  return <ReviewPage />;
}

export const Empty = {
  render: () => <EmptyStory />,
};

function ErrorStateStory() {
  useEffect(() => {
    const room = buildRoom({ id: "sb-room-review-error", code: "ERR000" });
    seed(room, buildPlayer({ room_id: room.id }));
  }, []);
  return <ReviewPage />;
}

export const ErrorState = {
  render: () => <ErrorStateStory />,
};
