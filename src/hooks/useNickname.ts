import { useState, useEffect, useCallback } from "react";
import { getLastNickname, setLastNickname } from "../utils/joinFormPrefs";

interface UseNicknameResult {
  nickname: string | null;
  isLoading: boolean;
  setNickname: (name: string) => void;
  clearNickname: () => void;
}

export function useNickname(): UseNicknameResult {
  const [nickname, setNicknameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getLastNickname();
    setNicknameState(stored);
    setIsLoading(false);
  }, []);

  const setNickname = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed) {
      setLastNickname(trimmed);
      setNicknameState(trimmed);
    }
  }, []);

  const clearNickname = useCallback(() => {
    try {
      localStorage.removeItem("bb_last_nickname");
    } catch {
      // ignore
    }
    setNicknameState(null);
  }, []);

  return { nickname, isLoading, setNickname, clearNickname };
}
