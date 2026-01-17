import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import type { Room, Player } from "../types";
import { REALTIME_CHANNEL } from "../utils/constants";

type RoomChangeHandler = (room: Room) => void;
type PlayersChangeHandler = (players: Player[]) => void;

interface RoomSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

/**
 * Subscribes to real-time changes for a specific room
 * Handles room status changes and player list updates
 */
export function subscribeToRoom(
  roomId: string,
  onRoomChange: RoomChangeHandler,
  onPlayersChange: PlayersChangeHandler,
): RoomSubscription {
  let playersCache: Player[] | null = null;
  const refreshPlayers = async () => {
    const { data } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });

    if (data) {
      playersCache = data;
      onPlayersChange(data);
    }
  };

  const channel = supabase
    .channel(REALTIME_CHANNEL.roomState(roomId))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.new && typeof payload.new === "object") {
          onRoomChange(payload.new as Room);
        }
      },
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_players",
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        if (
          payload.eventType === "UPDATE" &&
          payload.new &&
          typeof payload.new === "object"
        ) {
          const updatedPlayer = payload.new as Player;
          if (playersCache) {
            const index = playersCache.findIndex(
              (p) => p.id === updatedPlayer.id,
            );
            if (index >= 0) {
              const next = [...playersCache];
              next[index] = updatedPlayer;
              playersCache = next;
              onPlayersChange(next);
              return;
            }
          }
        }

        await refreshPlayers();
      },
    )
    .subscribe();

  refreshPlayers().catch(() => {});

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Subscribes to player progress updates during a game
 */
export function subscribeToGameProgress(
  roomId: string,
  onPlayersChange: PlayersChangeHandler,
): RoomSubscription {
  let playersCache: Player[] | null = null;
  const refreshPlayers = async () => {
    const { data } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });

    if (data) {
      playersCache = data;
      onPlayersChange(data);
    }
  };

  const channel = supabase
    .channel(REALTIME_CHANNEL.roomProgress(roomId))
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "room_players",
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        if (payload.new && typeof payload.new === "object") {
          const updatedPlayer = payload.new as Player;
          if (playersCache) {
            const index = playersCache.findIndex(
              (p) => p.id === updatedPlayer.id,
            );
            if (index >= 0) {
              const next = [...playersCache];
              next[index] = updatedPlayer;
              playersCache = next;
              onPlayersChange(next);
              return;
            }
          }
        }

        await refreshPlayers();
      },
    )
    .subscribe();

  refreshPlayers().catch(() => {});

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
