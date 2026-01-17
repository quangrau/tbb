import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Player, Room } from "../types";
import { ROOM_STATUS } from "../utils/constants";

vi.mock("../services/roomService", () => ({
  createRoom: vi.fn(),
  joinRoom: vi.fn(),
  fetchRoom: vi.fn(),
  fetchRoomPlayers: vi.fn(),
  setPlayerReady: vi.fn(),
  updateRoomStatus: vi.fn(),
  leaveRoom: vi.fn(),
  resetRoomForReplay: vi.fn(),
}));

vi.mock("../services/realtimeService", () => ({
  subscribeToRoom: vi.fn(() => ({
    channel: {} as never,
    unsubscribe: vi.fn(),
  })),
}));

vi.mock("../utils/activeRoom", () => ({
  clearActiveRoom: vi.fn(),
  getActiveRoomExpiresAtMs: vi.fn(() => 123),
  setActiveRoom: vi.fn(),
}));

import { useRoomStore } from "./roomStore";
import * as roomService from "../services/roomService";
import * as realtimeService from "../services/realtimeService";
import * as activeRoom from "../utils/activeRoom";

function makeRoom(overrides?: Partial<Room>): Room {
  return {
    id: "room_1",
    code: "ABCDEF",
    grade: 3,
    term: 1,
    max_players: 5,
    questions_count: 10,
    time_per_question_sec: 10,
    question_ids: ["q1", "q2"],
    status: ROOM_STATUS.WAITING,
    created_at: "2025-01-01T00:00:00.000Z",
    started_at: null,
    finished_at: null,
    expires_at: "2025-01-01T00:10:00.000Z",
    ...overrides,
  };
}

function makePlayer(overrides?: Partial<Player>): Player {
  return {
    id: "player_1",
    room_id: "room_1",
    device_id: "device_1",
    nickname: "Alice",
    is_ready: false,
    is_finished: false,
    current_question_index: 0,
    score: 0,
    total_time_ms: 0,
    joined_at: "2025-01-01T00:00:00.000Z",
    finished_at: null,
    last_heartbeat: "2025-01-01T00:00:00.000Z",
    is_owner: false,
    ...overrides,
  };
}

describe("useRoomStore", () => {
  beforeEach(() => {
    useRoomStore.getState().reset();
    vi.clearAllMocks();
  });

  it("createRoom sets state, persists active room, and subscribes", async () => {
    const room = makeRoom();
    const player = makePlayer({ is_owner: true });

    vi.mocked(roomService.createRoom).mockResolvedValue({ room, player });

    await useRoomStore
      .getState()
      .createRoom(3, 1, player.device_id, player.nickname, {
        questionsCount: 12,
        timePerQuestionSec: 9,
        maxPlayers: 4,
      });

    const state = useRoomStore.getState();
    expect(state.room?.id).toBe(room.id);
    expect(state.currentPlayer?.id).toBe(player.id);
    expect(state.players.map((p) => p.id)).toEqual([player.id]);
    expect(activeRoom.setActiveRoom).toHaveBeenCalledWith(room, 123);
    expect(realtimeService.subscribeToRoom).toHaveBeenCalledTimes(1);
    expect(state._unsubscribe).not.toBeNull();
  });

  it("joinRoom loads room players and subscribes", async () => {
    const room = makeRoom();
    const currentPlayer = makePlayer({ id: "player_me" });
    const players = [
      makePlayer({ id: "player_me" }),
      makePlayer({ id: "player_other" }),
    ];

    vi.mocked(roomService.joinRoom).mockResolvedValue({
      room,
      player: currentPlayer,
    });
    vi.mocked(roomService.fetchRoomPlayers).mockResolvedValue(players);

    await useRoomStore
      .getState()
      .joinRoom(room.code, currentPlayer.device_id, currentPlayer.nickname);

    const state = useRoomStore.getState();
    expect(state.room?.id).toBe(room.id);
    expect(state.players.map((p) => p.id)).toEqual([
      "player_me",
      "player_other",
    ]);
    expect(state.currentPlayer?.id).toBe("player_me");
    expect(activeRoom.setActiveRoom).toHaveBeenCalledWith(room, 123);
    expect(realtimeService.subscribeToRoom).toHaveBeenCalledTimes(1);
  });

  it("loadRoom throws and sets error when room not found", async () => {
    vi.mocked(roomService.fetchRoom).mockResolvedValue(null);

    await expect(
      useRoomStore.getState().loadRoom("missing", "device_1"),
    ).rejects.toThrow("Room not found");

    expect(useRoomStore.getState().error).toBe("Room not found");
  });

  it("loadRoom clears active room and throws when player not in room", async () => {
    const room = makeRoom();
    vi.mocked(roomService.fetchRoom).mockResolvedValue(room);
    vi.mocked(roomService.fetchRoomPlayers).mockResolvedValue([
      makePlayer({ device_id: "other" }),
    ]);

    await expect(
      useRoomStore.getState().loadRoom(room.id, "device_1"),
    ).rejects.toThrow("Player not found in room");

    expect(activeRoom.clearActiveRoom).toHaveBeenCalledTimes(1);
  });

  it("setReady optimistically updates current player and players list", async () => {
    const room = makeRoom();
    const me = makePlayer({
      id: "player_me",
      room_id: room.id,
      is_ready: false,
    });
    const others = makePlayer({
      id: "player_other",
      room_id: room.id,
      is_ready: false,
    });

    useRoomStore.setState({ room, currentPlayer: me, players: [me, others] });
    vi.mocked(roomService.setPlayerReady).mockResolvedValue(undefined);

    await useRoomStore.getState().setReady(true);

    const state = useRoomStore.getState();
    expect(roomService.setPlayerReady).toHaveBeenCalledWith("player_me", true);
    expect(state.currentPlayer?.is_ready).toBe(true);
    expect(state.players.find((p) => p.id === "player_me")?.is_ready).toBe(
      true,
    );
    expect(state.players.find((p) => p.id === "player_other")?.is_ready).toBe(
      false,
    );
  });

  it("startGame only starts when owner and all players ready with enough players", async () => {
    const room = makeRoom({ status: ROOM_STATUS.WAITING });
    const me = makePlayer({
      id: "player_me",
      room_id: room.id,
      is_owner: true,
      is_ready: true,
    });
    const other = makePlayer({
      id: "player_other",
      room_id: room.id,
      is_ready: true,
    });

    useRoomStore.setState({ room, currentPlayer: me, players: [me, other] });
    vi.mocked(roomService.updateRoomStatus).mockResolvedValue(undefined);

    await useRoomStore.getState().startGame();

    expect(roomService.updateRoomStatus).toHaveBeenCalledWith(
      room.id,
      ROOM_STATUS.PLAYING,
    );
  });

  it("startGame does nothing when not owner", async () => {
    const room = makeRoom();
    const me = makePlayer({
      id: "player_me",
      room_id: room.id,
      is_owner: false,
      is_ready: true,
    });
    const other = makePlayer({
      id: "player_other",
      room_id: room.id,
      is_ready: true,
    });

    useRoomStore.setState({ room, currentPlayer: me, players: [me, other] });
    vi.mocked(roomService.updateRoomStatus).mockResolvedValue(undefined);

    await useRoomStore.getState().startGame();

    expect(roomService.updateRoomStatus).not.toHaveBeenCalled();
  });

  it("leaveRoom unsubscribes, clears active room, and resets state", async () => {
    const unsubscribe = vi.fn();
    const room = makeRoom();
    const me = makePlayer({ id: "player_me", room_id: room.id });

    useRoomStore.setState({
      room,
      currentPlayer: me,
      players: [me],
      _unsubscribe: unsubscribe,
    });

    vi.mocked(roomService.leaveRoom).mockRejectedValue(new Error("ignored"));

    await useRoomStore.getState().leaveRoom();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(activeRoom.clearActiveRoom).toHaveBeenCalledTimes(1);
    const state = useRoomStore.getState();
    expect(state.room).toBeNull();
    expect(state.currentPlayer).toBeNull();
    expect(state.players).toEqual([]);
    expect(state._unsubscribe).toBeNull();
  });
});
