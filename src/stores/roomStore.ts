import { create } from 'zustand'
import type { Room, Player } from '../types'
import {
  createRoom as createRoomApi,
  joinRoom as joinRoomApi,
  fetchRoom,
  fetchRoomPlayers,
  setPlayerReady as setPlayerReadyApi,
  updateRoomStatus,
  leaveRoom as leaveRoomApi,
} from '../services/roomService'
import { subscribeToRoom } from '../services/realtimeService'
import {
  clearActiveRoomCode,
  clearActiveRoomId,
  setActiveRoomCode,
  setActiveRoomId,
} from '../utils/activeRoom'

interface ChallengeSettings {
  questionsCount?: number
  timePerQuestionSec?: number
  maxPlayers?: number
}

interface RoomState {
  // State
  room: Room | null
  players: Player[]
  currentPlayer: Player | null
  isLoading: boolean
  error: string | null

  // Actions
  createRoom: (
    grade: number,
    term: number,
    deviceId: string,
    nickname: string,
    settings?: ChallengeSettings
  ) => Promise<void>
  joinRoom: (code: string, deviceId: string, nickname: string) => Promise<void>
  loadRoom: (roomId: string, deviceId: string) => Promise<void>
  setReady: (isReady: boolean) => Promise<void>
  startGame: () => Promise<void>
  leaveRoom: () => Promise<void>
  reset: () => void

  // Internal
  _unsubscribe: (() => void) | null
  _subscribe: (roomId: string) => void
}

export const useRoomStore = create<RoomState>((set, get) => ({
  // Initial state
  room: null,
  players: [],
  currentPlayer: null,
  isLoading: false,
  error: null,
  _unsubscribe: null,

  // Subscribe to real-time updates
  _subscribe: (roomId: string) => {
    const { _unsubscribe } = get()
    if (_unsubscribe) {
      _unsubscribe()
    }

    const subscription = subscribeToRoom(
      roomId,
      (room) => {
        set({ room })
      },
      (players) => {
        set((state) => {
          if (!state.currentPlayer) return { players }
          const updated = players.find((p) => p.id === state.currentPlayer?.id)
          if (!updated) return { players }
          return { players, currentPlayer: updated }
        })
      }
    )

    set({ _unsubscribe: subscription.unsubscribe })
  },

  // Create a new room
  createRoom: async (grade, term, deviceId, nickname, settings) => {
    set({ isLoading: true, error: null })
    try {
      const { room, player } = await createRoomApi({
        grade,
        term,
        deviceId,
        nickname,
        ...settings,
      })
      set({
        room,
        players: [player],
        currentPlayer: player,
        isLoading: false,
      })
      setActiveRoomId(room.id)
      setActiveRoomCode(room.code)
      get()._subscribe(room.id)
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to create room',
        isLoading: false,
      })
      throw err
    }
  },

  // Join an existing room
  joinRoom: async (code, deviceId, nickname) => {
    set({ isLoading: true, error: null })
    try {
      const { room, player } = await joinRoomApi({ code, deviceId, nickname })
      const players = await fetchRoomPlayers(room.id)
      set({
        room,
        players,
        currentPlayer: player,
        isLoading: false,
      })
      setActiveRoomId(room.id)
      setActiveRoomCode(room.code)
      get()._subscribe(room.id)
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to join room',
        isLoading: false,
      })
      throw err
    }
  },

  // Load an existing room (for page refresh)
  loadRoom: async (roomId, deviceId) => {
    set({ isLoading: true, error: null })
    try {
      const room = await fetchRoom(roomId)
      if (!room) {
        throw new Error('Room not found')
      }

      const players = await fetchRoomPlayers(roomId)
      const currentPlayer = players.find(p => p.device_id === deviceId) || null

      if (!currentPlayer) {
        clearActiveRoomId()
        clearActiveRoomCode()
        throw new Error('Player not found in room')
      }

      set({
        room,
        players,
        currentPlayer,
        isLoading: false,
      })
      setActiveRoomId(roomId)
      setActiveRoomCode(room.code)
      get()._subscribe(roomId)
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load room',
        isLoading: false,
      })
      throw err
    }
  },

  // Toggle ready status
  setReady: async (isReady) => {
    const { currentPlayer, room, players } = get()
    if (!currentPlayer || !room) return

    try {
      await setPlayerReadyApi(currentPlayer.id, isReady)

      // Optimistic update
      set({
        currentPlayer: { ...currentPlayer, is_ready: isReady },
        players: players.map(p =>
          p.id === currentPlayer.id ? { ...p, is_ready: isReady } : p
        ),
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update ready status' })
    }
  },

  // Start the game (called when all players are ready)
  startGame: async () => {
    const { room } = get()
    if (!room) return

    try {
      await updateRoomStatus(room.id, 'playing')
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to start game' })
    }
  },

  // Leave the room
  leaveRoom: async () => {
    const { currentPlayer, _unsubscribe } = get()

    if (_unsubscribe) {
      _unsubscribe()
    }

    if (currentPlayer) {
      try {
        await leaveRoomApi(currentPlayer.id)
      } catch {
        // Ignore errors when leaving
      }
    }

    clearActiveRoomId()
    clearActiveRoomCode()
    set({
      room: null,
      players: [],
      currentPlayer: null,
      error: null,
      _unsubscribe: null,
    })
  },

  // Reset store state
  reset: () => {
    const { _unsubscribe } = get()
    if (_unsubscribe) {
      _unsubscribe()
    }

    clearActiveRoomId()
    clearActiveRoomCode()
    set({
      room: null,
      players: [],
      currentPlayer: null,
      isLoading: false,
      error: null,
      _unsubscribe: null,
    })
  },
}))
