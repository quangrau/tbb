import { useEffect } from "react";
import type { Player, Room } from "../types";
import type { Question } from "../types/database";
import { useGameStore } from "../stores/gameStore";
import { useRoomStore } from "../stores/roomStore";
import { ROOM_STATUS } from "../utils/constants";
import ChallengePage from "./ChallengePage";

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
    question_ids: ["sb-q-1", "sb-q-2"],
    status: ROOM_STATUS.PLAYING,
    created_at: nowIso(-60_000),
    started_at: null,
    finished_at: null,
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
    is_finished: false,
    current_question_index: 0,
    score: 0,
    total_time_ms: 0,
    joined_at: nowIso(-60_000),
    finished_at: null,
    last_heartbeat: nowIso(0),
    is_owner: true,
    ...overrides,
  };
}

const mcQuestion: Question = {
  id: "sb-q-1",
  grade: 3,
  term: 0,
  question_text: "2 + 3 = ?",
  options: ["4", "5", "6", "7"],
  correct_option_index: 1,
  explanation: "2 + 3 = 5",
  created_at: nowIso(-60_000),
  question_type: "multiple_choice",
  correct_answer: null,
  acceptable_answers: null,
  answer_unit: null,
  answer_type: "integer",
};

const freeFormQuestion: Question = {
  ...mcQuestion,
  id: "sb-q-2",
  question_text: "Write the number seven.",
  options: null,
  correct_option_index: null,
  question_type: "free_form",
  correct_answer: "7",
  acceptable_answers: ["7", "seven"],
  explanation: "Seven is written as 7.",
};

function seed(room: Room, players: Player[], currentPlayer: Player, questions: Question[]) {
  useRoomStore.setState((state) => ({
    ...state,
    room,
    players,
    currentPlayer,
    isLoading: false,
    error: null,
  }));

  useGameStore.setState((state) => ({
    ...state,
    questions,
    currentQuestionIndex: 0,
    score: currentPlayer.score,
    isFinished: false,
    isWaitingForOthers: false,
    players,
    lastAnswerCorrect: null,
    error: null,
  }));
}

export default {
  title: "Screens/Challenge",
  component: ChallengePage,
};

function MultipleChoiceStory() {
  useEffect(() => {
    const room = buildRoom({ question_ids: [mcQuestion.id] });
    const host = buildPlayer({ room_id: room.id, score: 1 });
    const guest = buildPlayer({
      id: "sb-player-2",
      nickname: "Guest",
      is_owner: false,
      room_id: room.id,
    });
    seed(room, [host, guest], host, [mcQuestion]);
  }, []);
  return <ChallengePage />;
}

export const MultipleChoice = {
  render: () => <MultipleChoiceStory />,
};

function FreeFormStory() {
  useEffect(() => {
    const room = buildRoom({ question_ids: [freeFormQuestion.id] });
    const host = buildPlayer({ room_id: room.id });
    const guest = buildPlayer({
      id: "sb-player-2",
      nickname: "Guest",
      is_owner: false,
      room_id: room.id,
    });
    seed(room, [host, guest], host, [freeFormQuestion]);
  }, []);
  return <ChallengePage />;
}

export const FreeForm = {
  render: () => <FreeFormStory />,
};

function WaitingForOthersStory() {
  useEffect(() => {
    const room = buildRoom({
      question_ids: [mcQuestion.id, freeFormQuestion.id],
    });
    const host = buildPlayer({
      room_id: room.id,
      is_finished: true,
      score: 7,
      total_time_ms: 42000,
    });
    const guest = buildPlayer({
      id: "sb-player-2",
      nickname: "Guest",
      is_owner: false,
      room_id: room.id,
      is_finished: false,
      score: 6,
      total_time_ms: 45000,
    });
    seed(room, [host, guest], host, [mcQuestion, freeFormQuestion]);
    useGameStore.setState((state) => ({
      ...state,
      isFinished: true,
      isWaitingForOthers: true,
      score: host.score,
      totalTimeMs: host.total_time_ms,
    }));
  }, []);
  return <ChallengePage />;
}

export const WaitingForOthers = {
  render: () => <WaitingForOthersStory />,
};
