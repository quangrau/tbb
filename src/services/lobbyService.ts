import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import { REALTIME_CHANNEL } from "../utils/constants";
import { fetchPublicRooms } from "./roomService";
import type { LobbyRoom } from "../types/room";

type LobbyChangeHandler = (rooms: LobbyRoom[]) => void;

interface LobbySubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

/**
 * Subscribes to real-time changes for the lobby (public rooms)
 * Handles room creation, status changes, and player joins/leaves
 */
export function subscribeToLobby(
  onRoomsChange: LobbyChangeHandler,
  gradeFilter?: number | null,
): LobbySubscription {
  const refreshRooms = async () => {
    try {
      const rooms = await fetchPublicRooms({ grade: gradeFilter });
      onRoomsChange(rooms);
    } catch {
      // Silently handle errors during refresh
    }
  };

  const channel = supabase
    .channel(REALTIME_CHANNEL.lobby())
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
      },
      () => {
        refreshRooms();
      },
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_players",
      },
      () => {
        refreshRooms();
      },
    )
    .subscribe();

  // Initial fetch
  refreshRooms();

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
