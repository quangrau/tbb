import { useEffect } from "react";
import type { Player, Room } from "../types";
import { useRoomStore } from "../stores/roomStore";
import { ROOM_STATUS } from "../utils/constants";
import WaitingRoomPage from "./WaitingRoomPage";

function nowIso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function seedRoomStore(next: {
  room: Room;
  players: Player[];
  currentPlayer: Player;
}) {
  useRoomStore.setState((state) => ({
    ...state,
    room: next.room,
    players: next.players,
    currentPlayer: next.currentPlayer,
    isLoading: false,
    error: null,
  }));
}

const baseRoom: Room = {
  id: "sb-room-1",
  code: "ABC123",
  grade: 3,
  term: 0,
  max_players: 2,
  questions_count: 10,
  time_per_question_sec: 10,
  question_ids: ["sb-q-1", "sb-q-2", "sb-q-3", "sb-q-4", "sb-q-5"],
  status: ROOM_STATUS.WAITING,
  created_at: nowIso(-60_000),
  started_at: null,
  finished_at: null,
  expires_at: nowIso(60_000),
};

const host: Player = {
  id: "sb-player-1",
  room_id: baseRoom.id,
  device_id: "sb-device-host",
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
};

const guestOnline: Player = {
  ...host,
  id: "sb-player-2",
  device_id: "sb-device-guest",
  nickname: "Guest",
  is_owner: false,
  is_ready: false,
  last_heartbeat: nowIso(0),
};

const guestOffline: Player = {
  ...guestOnline,
  last_heartbeat: nowIso(-10 * 60_000),
};

export default {
  title: "Screens/Waiting Room",
  component: WaitingRoomPage,
};

function HostViewStory() {
  useEffect(() => {
    seedRoomStore({
      room: baseRoom,
      players: [host, guestOnline],
      currentPlayer: host,
    });
  }, []);
  return <WaitingRoomPage />;
}

export const HostView = {
  render: () => <HostViewStory />,
};

function OfflinePlayerStory() {
  useEffect(() => {
    seedRoomStore({
      room: baseRoom,
      players: [host, guestOffline],
      currentPlayer: host,
    });
  }, []);
  return <WaitingRoomPage />;
}

export const OfflinePlayer = {
  render: () => <OfflinePlayerStory />,
};
