import { create } from "zustand";
import type { LobbyRoom } from "../types/room";
import { fetchPublicRooms } from "../services/roomService";
import { subscribeToLobby } from "../services/lobbyService";

interface LobbyState {
  // State
  rooms: LobbyRoom[];
  isLoading: boolean;
  error: string | null;
  gradeFilter: number | null;

  // Actions
  loadRooms: () => Promise<void>;
  setGradeFilter: (grade: number | null) => void;
  subscribe: () => () => void;

  // Internal
  _unsubscribe: (() => void) | null;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  // Initial state
  rooms: [],
  isLoading: false,
  error: null,
  gradeFilter: null,
  _unsubscribe: null,

  // Load rooms from database
  loadRooms: async () => {
    const { gradeFilter } = get();
    set({ isLoading: true, error: null });

    try {
      const rooms = await fetchPublicRooms({ grade: gradeFilter });
      set({ rooms, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load rooms",
        isLoading: false,
      });
    }
  },

  // Set grade filter and reload rooms
  setGradeFilter: (grade) => {
    const { _unsubscribe, subscribe } = get();

    // Unsubscribe from current subscription
    if (_unsubscribe) {
      _unsubscribe();
    }

    set({ gradeFilter: grade, rooms: [], isLoading: true });

    // Resubscribe with new filter
    subscribe();
  },

  // Subscribe to realtime updates
  subscribe: () => {
    const { _unsubscribe, gradeFilter } = get();

    // Cleanup existing subscription
    if (_unsubscribe) {
      _unsubscribe();
    }

    const subscription = subscribeToLobby((rooms) => {
      set({ rooms, isLoading: false });
    }, gradeFilter);

    set({ _unsubscribe: subscription.unsubscribe });

    return subscription.unsubscribe;
  },
}));
