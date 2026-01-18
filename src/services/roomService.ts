import { supabase } from "../config/supabase";
import type { Room, Player } from "../types";
import { generateRoomCode } from "../utils/generateRoomCode";
import {
  DEFAULT_MAX_PLAYERS,
  DEFAULT_QUESTIONS_COUNT,
  DEFAULT_TIME_PER_QUESTION_SEC,
  ROOM_STATUS,
  GRADE_LABEL_BY_VALUE,
} from "../utils/constants";

interface CreateRoomParams {
  grade: number;
  term: number; // 0 = all terms
  deviceId: string;
  nickname: string;
  questionsCount?: number;
  timePerQuestionSec?: number;
  maxPlayers?: number;
  isPublic?: boolean;
  name?: string;
}

interface CreateRoomResult {
  room: Room;
  player: Player;
}

/**
 * Fetches random question IDs for a given grade and term
 * @param term - 0 means all terms
 */
export async function fetchRandomQuestionIds(
  grade: number,
  term: number,
  count: number,
): Promise<string[]> {
  let query = supabase.from("questions").select("id").eq("grade", grade);

  // Only filter by term if a specific term is selected (term > 0)
  if (term > 0) {
    query = query.eq("term", term);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch questions: ${error.message}`);

  const termLabel = term > 0 ? `Term ${term}` : "All Terms";
  if (!data || data.length < count) {
    throw new Error(
      `Not enough questions available for Grade ${grade}, ${termLabel}. Found ${data?.length || 0}, need ${count}.`,
    );
  }

  // Shuffle and pick random questions
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => q.id);
}

/**
 * Generates a default room name with grade and datetime
 * Format: "P3 Challenge - Jan 18, 2:30 PM"
 */
function generateRoomName(grade: number): string {
  const gradeLabel = GRADE_LABEL_BY_VALUE[grade] || `P${grade}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${gradeLabel} Challenge - ${dateStr}, ${timeStr}`;
}

/**
 * Creates a new room with random questions and adds the creator as the first player
 */
export async function createRoom(
  params: CreateRoomParams,
): Promise<CreateRoomResult> {
  const {
    grade,
    term,
    deviceId,
    nickname,
    questionsCount = DEFAULT_QUESTIONS_COUNT,
    timePerQuestionSec = DEFAULT_TIME_PER_QUESTION_SEC,
    maxPlayers = DEFAULT_MAX_PLAYERS,
    isPublic = true,
    name,
  } = params;

  // Generate room name if not provided
  const roomName = name?.trim() || generateRoomName(grade);

  // Fetch random questions for this room
  const questionIds = await fetchRandomQuestionIds(grade, term, questionsCount);

  // Generate a unique room code (retry if collision)
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    code = generateRoomCode();
    const { data: existing } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .single();

    if (!existing) break;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique room code");
  }

  // Create the room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      code: code!,
      grade,
      term,
      max_players: maxPlayers,
      questions_count: questionsCount,
      time_per_question_sec: timePerQuestionSec,
      question_ids: questionIds,
      status: ROOM_STATUS.WAITING,
      is_public: isPublic,
      name: roomName,
    })
    .select()
    .single();

  if (roomError) throw new Error(`Failed to create room: ${roomError.message}`);

  // Add the creator as the first player
  const { data: player, error: playerError } = await supabase
    .from("room_players")
    .insert({
      room_id: room.id,
      device_id: deviceId,
      nickname,
      is_owner: true,
    })
    .select()
    .single();

  if (playerError)
    throw new Error(`Failed to join room: ${playerError.message}`);

  return { room, player };
}

interface JoinRoomParams {
  code: string;
  deviceId: string;
  nickname: string;
}

interface JoinRoomResult {
  room: Room;
  player: Player;
}

/**
 * Joins an existing room by code
 */
export async function joinRoom(
  params: JoinRoomParams,
): Promise<JoinRoomResult> {
  const { code, deviceId, nickname } = params;

  // Find the room by code
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (roomError || !room) {
    throw new Error("Room not found. Please check the code and try again.");
  }

  // Check if player already in room
  const { data: existingPlayer } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", room.id)
    .eq("device_id", deviceId)
    .single();

  if (existingPlayer) {
    return { room, player: existingPlayer };
  }

  // Check room status (only blocks new players)
  if (room.status !== "waiting") {
    throw new Error("This room is no longer accepting players.");
  }

  // Check player count
  const { count } = await supabase
    .from("room_players")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room.id);

  if (count !== null && count >= room.max_players) {
    throw new Error("Room is full.");
  }

  // Join the room
  const { data: player, error: playerError } = await supabase
    .from("room_players")
    .insert({
      room_id: room.id,
      device_id: deviceId,
      nickname,
    })
    .select()
    .single();

  if (playerError) {
    if (playerError.code === "23505") {
      throw new Error("You are already in this room.");
    }
    throw new Error(`Failed to join room: ${playerError.message}`);
  }

  return { room, player };
}

/**
 * Fetches a room by ID with all players
 */
export async function fetchRoom(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Fetches all players in a room
 */
export async function fetchRoomPlayers(roomId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch players: ${error.message}`);
  return data || [];
}

/**
 * Updates a player's ready status
 */
export async function setPlayerReady(
  playerId: string,
  isReady: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("room_players")
    .update({ is_ready: isReady })
    .eq("id", playerId);

  if (error) throw new Error(`Failed to update ready status: ${error.message}`);
}

/**
 * Updates room status (e.g., to 'playing' when all ready)
 */
export async function updateRoomStatus(
  roomId: string,
  status: Room["status"],
): Promise<void> {
  const updates: Record<string, unknown> = { status };

  if (status === ROOM_STATUS.PLAYING) {
    updates.started_at = new Date().toISOString();
  } else if (status === ROOM_STATUS.FINISHED) {
    updates.finished_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("rooms")
    .update(updates)
    .eq("id", roomId);

  if (error) throw new Error(`Failed to update room status: ${error.message}`);
}

/**
 * Leaves a room (removes player)
 */
export async function leaveRoom(playerId: string): Promise<void> {
  const { error } = await supabase
    .from("room_players")
    .delete()
    .eq("id", playerId);

  if (error) throw new Error(`Failed to leave room: ${error.message}`);
}

export async function updatePlayerHeartbeat(playerId: string): Promise<void> {
  const { error } = await supabase
    .from("room_players")
    .update({ last_heartbeat: new Date().toISOString() })
    .eq("id", playerId);

  if (error) throw new Error(`Failed to update heartbeat: ${error.message}`);
}

export async function resetRoomForReplay(roomId: string): Promise<void> {
  const room = await fetchRoom(roomId);
  if (!room) throw new Error("Room not found");

  const questionIds = await fetchRandomQuestionIds(
    room.grade,
    room.term,
    room.questions_count,
  );

  const { error: roomError } = await supabase
    .from("rooms")
    .update({
      status: ROOM_STATUS.WAITING,
      question_ids: questionIds,
      started_at: null,
      finished_at: null,
    })
    .eq("id", roomId);

  if (roomError) throw new Error(`Failed to reset room: ${roomError.message}`);

  const { error: playersError } = await supabase
    .from("room_players")
    .update({
      is_ready: false,
      is_finished: false,
      score: 0,
      current_question_index: 0,
      total_time_ms: 0,
      finished_at: null,
    })
    .eq("room_id", roomId);

  if (playersError)
    throw new Error(`Failed to reset players: ${playersError.message}`);

  const { error: answersError } = await supabase
    .from("answers")
    .delete()
    .eq("room_id", roomId);

  if (answersError)
    throw new Error(`Failed to delete answers: ${answersError.message}`);
}

import type { LobbyRoom } from "../types/room";

interface FetchPublicRoomsParams {
  grade?: number | null;
}

/**
 * Fetches public rooms for the lobby
 * Returns rooms that are public, waiting, not expired, and not full
 */
export async function fetchPublicRooms(
  params: FetchPublicRoomsParams = {},
): Promise<LobbyRoom[]> {
  const { grade } = params;

  // Build the query for public waiting rooms
  let query = supabase
    .from("rooms")
    .select("*")
    .eq("is_public", true)
    .eq("status", "waiting")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (grade !== undefined && grade !== null) {
    query = query.eq("grade", grade);
  }

  const { data: rooms, error: roomsError } = await query;

  if (roomsError) {
    throw new Error(`Failed to fetch public rooms: ${roomsError.message}`);
  }

  if (!rooms || rooms.length === 0) {
    return [];
  }

  // Fetch player counts and host nicknames for each room
  const roomIds = rooms.map((r) => r.id);

  const { data: players, error: playersError } = await supabase
    .from("room_players")
    .select("room_id, nickname, is_owner")
    .in("room_id", roomIds);

  if (playersError) {
    throw new Error(`Failed to fetch room players: ${playersError.message}`);
  }

  // Build a map of room_id to player info
  const playerCountByRoom: Record<string, number> = {};
  const hostByRoom: Record<string, string> = {};

  for (const player of players || []) {
    playerCountByRoom[player.room_id] =
      (playerCountByRoom[player.room_id] || 0) + 1;
    if (player.is_owner) {
      hostByRoom[player.room_id] = player.nickname;
    }
  }

  // Filter out full rooms and map to LobbyRoom
  const lobbyRooms: LobbyRoom[] = rooms
    .filter((room) => {
      const playerCount = playerCountByRoom[room.id] || 0;
      return playerCount < room.max_players;
    })
    .map((room) => ({
      ...room,
      player_count: playerCountByRoom[room.id] || 0,
      host_nickname: hostByRoom[room.id] || "Unknown",
    }));

  return lobbyRooms;
}

interface JoinRoomByIdParams {
  roomId: string;
  deviceId: string;
  nickname: string;
}

interface JoinRoomByIdResult {
  room: Room;
  player: Player;
}

/**
 * Joins an existing room by ID (for lobby joins)
 */
export async function joinRoomById(
  params: JoinRoomByIdParams,
): Promise<JoinRoomByIdResult> {
  const { roomId, deviceId, nickname } = params;

  // Fetch the room by ID
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    throw new Error("Room not found.");
  }

  // Check if player already in room
  const { data: existingPlayer } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", room.id)
    .eq("device_id", deviceId)
    .single();

  if (existingPlayer) {
    return { room, player: existingPlayer };
  }

  // Check room status
  if (room.status !== "waiting") {
    throw new Error("This room is no longer accepting players.");
  }

  // Check if room is expired
  if (new Date(room.expires_at) < new Date()) {
    throw new Error("This room has expired.");
  }

  // Check player count
  const { count } = await supabase
    .from("room_players")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room.id);

  if (count !== null && count >= room.max_players) {
    throw new Error("Room is full.");
  }

  // Join the room
  const { data: player, error: playerError } = await supabase
    .from("room_players")
    .insert({
      room_id: room.id,
      device_id: deviceId,
      nickname,
    })
    .select()
    .single();

  if (playerError) {
    if (playerError.code === "23505") {
      throw new Error("You are already in this room.");
    }
    throw new Error(`Failed to join room: ${playerError.message}`);
  }

  return { room, player };
}
