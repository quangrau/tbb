const ACTIVE_ROOM_ID_KEY = "bb_active_room_id";
const ACTIVE_ROOM_CODE_KEY = "bb_active_room_code";

export function getActiveRoomId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ROOM_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveRoomId(roomId: string): void {
  try {
    localStorage.setItem(ACTIVE_ROOM_ID_KEY, roomId);
  } catch {
    // ignore
  }
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
    return localStorage.getItem(ACTIVE_ROOM_CODE_KEY);
  } catch {
    return null;
  }
}

export function setActiveRoomCode(code: string): void {
  try {
    localStorage.setItem(ACTIVE_ROOM_CODE_KEY, code);
  } catch {
    // ignore
  }
}

export function clearActiveRoomCode(): void {
  try {
    localStorage.removeItem(ACTIVE_ROOM_CODE_KEY);
  } catch {
    // ignore
  }
}
