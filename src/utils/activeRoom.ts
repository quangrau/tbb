import type { Room } from "../types";
import {
  DEFAULT_QUESTIONS_COUNT,
  DEFAULT_TIME_PER_QUESTION_SEC,
} from "./constants";

const ACTIVE_ROOM_ID_KEY = "bb_active_room_id";
const ACTIVE_ROOM_CODE_KEY = "bb_active_room_code";

type StoredWithExpiry = {
  value: string;
  expiresAtMs: number;
};

function getDefaultExpiresAtMs(): number {
  return (
    Date.now() + DEFAULT_QUESTIONS_COUNT * DEFAULT_TIME_PER_QUESTION_SEC * 1000
  );
}

function parseStoredValue(key: string, raw: string | null): string | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredWithExpiry;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.value === "string" &&
      typeof parsed.expiresAtMs === "number"
    ) {
      if (!Number.isFinite(parsed.expiresAtMs) || parsed.expiresAtMs <= 0) {
        localStorage.removeItem(key);
        return null;
      }
      if (Date.now() > parsed.expiresAtMs) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    }
  } catch {
    // ignore
  }

  const expiresAtMs = getDefaultExpiresAtMs();
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ value: raw, expiresAtMs } satisfies StoredWithExpiry),
    );
  } catch {
    // ignore
  }
  return raw;
}

function setStoredValue(
  key: string,
  value: string,
  expiresAtMs?: number,
): void {
  const resolvedExpiresAtMs =
    typeof expiresAtMs === "number" && Number.isFinite(expiresAtMs)
      ? expiresAtMs
      : getDefaultExpiresAtMs();
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        value,
        expiresAtMs: resolvedExpiresAtMs,
      } satisfies StoredWithExpiry),
    );
  } catch {
    // ignore
  }
}

function toMs(dateTime: string | null): number | null {
  if (!dateTime) return null;
  const ms = Date.parse(dateTime);
  return Number.isFinite(ms) ? ms : null;
}

export function getActiveRoomExpiresAtMs(room: Room): number {
  const durationMs = room.questions_count * room.time_per_question_sec * 1000;
  const startedAtMs = toMs(room.started_at);
  if (startedAtMs !== null) return startedAtMs + durationMs;

  const expiresAtMs = toMs(room.expires_at);
  if (expiresAtMs !== null) return expiresAtMs;

  return Date.now() + durationMs;
}

export function setActiveRoom(
  room: Pick<Room, "id" | "code">,
  expiresAtMs: number,
): void {
  setActiveRoomId(room.id, expiresAtMs);
  setActiveRoomCode(room.code, expiresAtMs);
}

export function clearActiveRoom(): void {
  clearActiveRoomId();
  clearActiveRoomCode();
}

export function getActiveRoomId(): string | null {
  try {
    return parseStoredValue(
      ACTIVE_ROOM_ID_KEY,
      localStorage.getItem(ACTIVE_ROOM_ID_KEY),
    );
  } catch {
    return null;
  }
}

export function setActiveRoomId(roomId: string, expiresAtMs?: number): void {
  setStoredValue(ACTIVE_ROOM_ID_KEY, roomId, expiresAtMs);
}

export function clearActiveRoomId(): void {
  try {
    localStorage.removeItem(ACTIVE_ROOM_ID_KEY);
  } catch {
    // ignore
  }
}

export function getActiveRoomCode(): string | null {
  try {
    return parseStoredValue(
      ACTIVE_ROOM_CODE_KEY,
      localStorage.getItem(ACTIVE_ROOM_CODE_KEY),
    );
  } catch {
    return null;
  }
}

export function setActiveRoomCode(code: string, expiresAtMs?: number): void {
  setStoredValue(ACTIVE_ROOM_CODE_KEY, code, expiresAtMs);
}

export function clearActiveRoomCode(): void {
  try {
    localStorage.removeItem(ACTIVE_ROOM_CODE_KEY);
  } catch {
    // ignore
  }
}
