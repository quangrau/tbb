import { supabase } from '../config/supabase'
import type { Room, Player } from '../types'
import { generateRoomCode } from '../utils/generateRoomCode'
import { DEFAULT_MAX_PLAYERS, DEFAULT_QUESTIONS_COUNT, DEFAULT_TIME_PER_QUESTION_SEC } from '../utils/constants'

interface CreateRoomParams {
  grade: number
  term: number
  deviceId: string
  nickname: string
}

interface CreateRoomResult {
  room: Room
  player: Player
}

/**
 * Fetches random question IDs for a given grade and term
 */
async function fetchRandomQuestionIds(
  grade: number,
  term: number,
  count: number
): Promise<string[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id')
    .eq('grade', grade)
    .eq('term', term)

  if (error) throw new Error(`Failed to fetch questions: ${error.message}`)
  if (!data || data.length < count) {
    throw new Error(`Not enough questions available for Grade ${grade}, Term ${term}. Found ${data?.length || 0}, need ${count}.`)
  }

  // Shuffle and pick random questions
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(q => q.id)
}

/**
 * Creates a new room with random questions and adds the creator as the first player
 */
export async function createRoom(params: CreateRoomParams): Promise<CreateRoomResult> {
  const { grade, term, deviceId, nickname } = params

  // Fetch random questions for this room
  const questionIds = await fetchRandomQuestionIds(grade, term, DEFAULT_QUESTIONS_COUNT)

  // Generate a unique room code (retry if collision)
  let code: string
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    code = generateRoomCode()
    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', code)
      .single()

    if (!existing) break
    attempts++
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique room code')
  }

  // Create the room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      code: code!,
      grade,
      term,
      max_players: DEFAULT_MAX_PLAYERS,
      questions_count: DEFAULT_QUESTIONS_COUNT,
      time_per_question_sec: DEFAULT_TIME_PER_QUESTION_SEC,
      question_ids: questionIds,
      status: 'waiting',
    })
    .select()
    .single()

  if (roomError) throw new Error(`Failed to create room: ${roomError.message}`)

  // Add the creator as the first player
  const { data: player, error: playerError } = await supabase
    .from('room_players')
    .insert({
      room_id: room.id,
      device_id: deviceId,
      nickname,
    })
    .select()
    .single()

  if (playerError) throw new Error(`Failed to join room: ${playerError.message}`)

  return { room, player }
}

interface JoinRoomParams {
  code: string
  deviceId: string
  nickname: string
}

interface JoinRoomResult {
  room: Room
  player: Player
}

/**
 * Joins an existing room by code
 */
export async function joinRoom(params: JoinRoomParams): Promise<JoinRoomResult> {
  const { code, deviceId, nickname } = params

  // Find the room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (roomError || !room) {
    throw new Error('Room not found. Please check the code and try again.')
  }

  // Check if player already in room
  const { data: existingPlayer } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', room.id)
    .eq('device_id', deviceId)
    .single()

  if (existingPlayer) {
    return { room, player: existingPlayer }
  }

  // Check room status (only blocks new players)
  if (room.status !== 'waiting') {
    throw new Error('This room is no longer accepting players.')
  }

  // Check player count
  const { count } = await supabase
    .from('room_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id)

  if (count !== null && count >= room.max_players) {
    throw new Error('Room is full.')
  }

  // Join the room
  const { data: player, error: playerError } = await supabase
    .from('room_players')
    .insert({
      room_id: room.id,
      device_id: deviceId,
      nickname,
    })
    .select()
    .single()

  if (playerError) {
    if (playerError.code === '23505') {
      throw new Error('You are already in this room.')
    }
    throw new Error(`Failed to join room: ${playerError.message}`)
  }

  return { room, player }
}

/**
 * Fetches a room by ID with all players
 */
export async function fetchRoom(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error) return null
  return data
}

/**
 * Fetches all players in a room
 */
export async function fetchRoomPlayers(roomId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch players: ${error.message}`)
  return data || []
}

/**
 * Updates a player's ready status
 */
export async function setPlayerReady(playerId: string, isReady: boolean): Promise<void> {
  const { error } = await supabase
    .from('room_players')
    .update({ is_ready: isReady })
    .eq('id', playerId)

  if (error) throw new Error(`Failed to update ready status: ${error.message}`)
}

/**
 * Updates room status (e.g., to 'playing' when all ready)
 */
export async function updateRoomStatus(
  roomId: string,
  status: Room['status']
): Promise<void> {
  const updates: Record<string, unknown> = { status }

  if (status === 'playing') {
    updates.started_at = new Date().toISOString()
  } else if (status === 'finished') {
    updates.finished_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', roomId)

  if (error) throw new Error(`Failed to update room status: ${error.message}`)
}

/**
 * Leaves a room (removes player)
 */
export async function leaveRoom(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('room_players')
    .delete()
    .eq('id', playerId)

  if (error) throw new Error(`Failed to leave room: ${error.message}`)
}

export async function updatePlayerHeartbeat(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('room_players')
    .update({ last_heartbeat: new Date().toISOString() })
    .eq('id', playerId)

  if (error) throw new Error(`Failed to update heartbeat: ${error.message}`)
}
