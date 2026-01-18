import type { Player, Room } from "../../types";

type RoomChangeHandler = (room: Room) => void;
type PlayersChangeHandler = (players: Player[]) => void;

type RoomSubscription = {
  channel: unknown;
  unsubscribe: () => void;
};

export function subscribeToRoom(
  roomId: string,
  onRoomChange: RoomChangeHandler,
  onPlayersChange: PlayersChangeHandler,
): RoomSubscription {
  void roomId;
  void onRoomChange;
  void onPlayersChange;
  return { channel: null, unsubscribe: () => {} };
}

export function subscribeToGameProgress(
  roomId: string,
  onPlayersChange: PlayersChangeHandler,
): RoomSubscription {
  void roomId;
  void onPlayersChange;
  return { channel: null, unsubscribe: () => {} };
}

