import { Button } from "./ui/Button";
import type { LobbyRoom } from "../types/room";
import { GRADE_LABEL_BY_VALUE } from "../utils/constants";

interface RoomCardProps {
  room: LobbyRoom;
  onJoin: (roomId: string) => void;
  isJoining: boolean;
}

export function RoomCard({ room, onJoin, isJoining }: RoomCardProps) {
  const gradeLabel = GRADE_LABEL_BY_VALUE[room.grade] || `P${room.grade}`;

  return (
    <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-4 shadow-bb-neo-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-bb-ink text-lg truncate">
            {room.name || "Untitled Room"}
          </h3>
          <p className="text-bb-muted text-sm font-bold">
            Hosted by {room.host_nickname}
          </p>
        </div>
        <span className="ml-2 px-2 py-1 bg-bb-primary text-white text-xs font-bold rounded-bb-lg shrink-0">
          {gradeLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-bb-muted font-bold mb-4">
        <span>{room.questions_count} Qs</span>
        <span>{room.time_per_question_sec}s each</span>
        <span>
          {room.player_count}/{room.max_players} players
        </span>
      </div>

      <Button
        fullWidth
        size="sm"
        onClick={() => onJoin(room.id)}
        disabled={isJoining}
      >
        {isJoining ? "Joining..." : "Join"}
      </Button>
    </div>
  );
}
