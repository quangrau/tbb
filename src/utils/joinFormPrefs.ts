const LAST_NICKNAME_KEY = "bb_last_nickname";

export function getLastNickname(): string | null {
  try {
    return localStorage.getItem(LAST_NICKNAME_KEY);
  } catch {
    return null;
  }
}

export function setLastNickname(nickname: string): void {
  try {
    localStorage.setItem(LAST_NICKNAME_KEY, nickname);
  } catch {
    // ignore
  }
}
