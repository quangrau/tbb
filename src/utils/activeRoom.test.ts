import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Room } from "../types";
import {
  clearActiveRoom,
  getActiveRoomCode,
  getActiveRoomExpiresAtMs,
  getActiveRoomId,
  setActiveRoom,
  setActiveRoomCode,
  setActiveRoomId,
} from "./activeRoom";

const ACTIVE_ROOM_ID_KEY = "bb_active_room_id";
const ACTIVE_ROOM_CODE_KEY = "bb_active_room_code";

describe("activeRoom", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("stores and reads active room id/code with expiry", () => {
    const expiresAtMs = Date.now() + 10_000;
    setActiveRoom({ id: "room-1", code: "ABCDEF" }, expiresAtMs);

    expect(getActiveRoomId()).toBe("room-1");
    expect(getActiveRoomCode()).toBe("ABCDEF");
  });

  it("returns null after expiry and clears storage", () => {
    const expiresAtMs = Date.now() + 1_000;
    setActiveRoomId("room-2", expiresAtMs);
    expect(getActiveRoomId()).toBe("room-2");

    vi.setSystemTime(new Date(expiresAtMs + 1));
    expect(getActiveRoomId()).toBeNull();
    expect(localStorage.getItem(ACTIVE_ROOM_ID_KEY)).toBeNull();
  });

  it("migrates legacy raw values into JSON format", () => {
    localStorage.setItem(ACTIVE_ROOM_CODE_KEY, "ZZZZZZ");
    const value = getActiveRoomCode();
    expect(value).toBe("ZZZZZZ");

    const stored = localStorage.getItem(ACTIVE_ROOM_CODE_KEY);
    expect(stored).toMatch(/"value"\s*:\s*"ZZZZZZ"/);
  });

  it("clears active room keys", () => {
    setActiveRoomId("room-3");
    setActiveRoomCode("AAAAAA");
    expect(getActiveRoomId()).toBe("room-3");
    expect(getActiveRoomCode()).toBe("AAAAAA");

    clearActiveRoom();
    expect(getActiveRoomId()).toBeNull();
    expect(getActiveRoomCode()).toBeNull();
  });

  it("computes expiresAt using started_at when present", () => {
    const startedAt = "2024-01-01T00:00:10.000Z";
    const room = {
      questions_count: 10,
      time_per_question_sec: 3,
      started_at: startedAt,
      expires_at: null,
    } as unknown as Room;

    expect(getActiveRoomExpiresAtMs(room)).toBe(Date.parse(startedAt) + 30_000);
  });

  it("falls back to expires_at when started_at is missing", () => {
    const expiresAt = "2024-01-01T00:01:00.000Z";
    const room = {
      questions_count: 10,
      time_per_question_sec: 3,
      started_at: null,
      expires_at: expiresAt,
    } as unknown as Room;

    expect(getActiveRoomExpiresAtMs(room)).toBe(Date.parse(expiresAt));
  });

  it("falls back to now + duration when timestamps are missing", () => {
    const now = Date.now();
    const room = {
      questions_count: 10,
      time_per_question_sec: 3,
      started_at: null,
      expires_at: null,
    } as unknown as Room;

    expect(getActiveRoomExpiresAtMs(room)).toBe(now + 30_000);
  });
});
