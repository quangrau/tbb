import type { Player, Room } from "../../types";
import { ROOM_STATUS } from "../../utils/constants";

type CreateRoomParams = {
  grade: number;
  term: number;
  deviceId: string;
  nickname: string;
  questionsCount?: number;
  timePerQuestionSec?: number;
  maxPlayers?: number;
};

type CreateRoomResult = {
  room: Room;
  player: Player;
};

type JoinRoomParams = {
  code: string;
  deviceId: string;
  nickname: string;
};

type JoinRoomResult = {
  room: Room;
  player: Player;
};

function nowIso(): string {
  return new Date().toISOString();
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
    status: ROOM_STATUS.WAITING,
    created_at: nowIso(),
    started_at: null,
    finished_at: null,
    expires_at: nowIso(),
    is_public: true,
    name: "Test Room",
    ...overrides,
  };
}

function buildPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "sb-player-1",
    room_id: "sb-room-1",
    device_id: "sb-device-1",
    nickname: "Player",
    is_ready: false,
    is_finished: false,
    current_question_index: 0,
    score: 0,
    total_time_ms: 0,
    joined_at: nowIso(),
    finished_at: null,
    last_heartbeat: nowIso(),
    is_owner: false,
    ...overrides,
  };
}

let roomState: Room = buildRoom();
let playersState: Player[] = [
  buildPlayer({
    id: "sb-player-1",
    nickname: "Host",
    is_owner: true,
    device_id: "sb-device-host",
  }),
  buildPlayer({
    id: "sb-player-2",
    nickname: "Guest",
    is_owner: false,
    device_id: "sb-device-guest",
  }),
];

export function __setMockRoomState(next: { room?: Room; players?: Player[] }) {
  if (next.room) roomState = next.room;
  if (next.players) playersState = next.players;
}

export async function createRoom(
  params: CreateRoomParams,
): Promise<CreateRoomResult> {
  roomState = buildRoom({
    grade: params.grade,
    term: params.term,
    max_players: params.maxPlayers ?? roomState.max_players,
    questions_count: params.questionsCount ?? roomState.questions_count,
    time_per_question_sec:
      params.timePerQuestionSec ?? roomState.time_per_question_sec,
  });

  const player = buildPlayer({
    id: "sb-player-1",
    room_id: roomState.id,
    device_id: params.deviceId,
    nickname: params.nickname,
    is_owner: true,
  });

  playersState = [player];
  return { room: roomState, player };
}

export async function joinRoom(
  params: JoinRoomParams,
): Promise<JoinRoomResult> {
  roomState = buildRoom({ code: params.code.toUpperCase() });
  const player = buildPlayer({
    id: "sb-player-2",
    room_id: roomState.id,
    device_id: params.deviceId,
    nickname: params.nickname,
    is_owner: false,
  });
  playersState = [
    buildPlayer({
      id: "sb-player-1",
      room_id: roomState.id,
      nickname: "Host",
      is_owner: true,
    }),
    player,
  ];
  return { room: roomState, player };
}

export async function fetchRoom(roomId: string): Promise<Room | null> {
  return roomId === roomState.id ? roomState : null;
}

export async function fetchRoomPlayers(roomId: string): Promise<Player[]> {
  return roomId === roomState.id ? playersState : [];
}

export async function setPlayerReady(
  playerId: string,
  isReady: boolean,
): Promise<void> {
  playersState = playersState.map((p) =>
    p.id === playerId ? { ...p, is_ready: isReady } : p,
  );
}

export async function updateRoomStatus(
  roomId: string,
  status: Room["status"],
): Promise<void> {
  if (roomId !== roomState.id) return;
  roomState = {
    ...roomState,
    status,
    started_at:
      status === ROOM_STATUS.PLAYING ? nowIso() : roomState.started_at,
    finished_at:
      status === ROOM_STATUS.FINISHED ? nowIso() : roomState.finished_at,
  };
}

export async function leaveRoom(playerId: string): Promise<void> {
  playersState = playersState.filter((p) => p.id !== playerId);
}

export async function updatePlayerHeartbeat(playerId: string): Promise<void> {
  playersState = playersState.map((p) =>
    p.id === playerId ? { ...p, last_heartbeat: nowIso() } : p,
  );
}

export async function resetRoomForReplay(roomId: string): Promise<void> {
  if (roomId !== roomState.id) return;
  roomState = buildRoom({ id: roomId, code: roomState.code });
  playersState = playersState.map((p) => ({
    ...p,
    is_ready: false,
    is_finished: false,
    score: 0,
    current_question_index: 0,
    total_time_ms: 0,
    finished_at: null,
    last_heartbeat: nowIso(),
  }));
}

