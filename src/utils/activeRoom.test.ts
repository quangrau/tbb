import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Room } from "../types";
import {
  clearActiveRoomId,
  getActiveRoomExpiresAtMs,
  getActiveRoomId,
  setActiveRoomId,
} from "./activeRoom";

describe("activeRoom", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    clearActiveRoomId();
  });

  it("stores and reads room id with expiry", () => {
    const expiresAtMs = Date.parse("2026-01-01T00:10:00.000Z");
    setActiveRoomId("room-1", expiresAtMs);

    expect(getActiveRoomId()).toBe("room-1");

    const raw = localStorage.getItem("bb_active_room_id");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as {
      value: string;
      expiresAtMs: number;
    };
    expect(parsed.value).toBe("room-1");
    expect(parsed.expiresAtMs).toBe(expiresAtMs);
  });

  it("migrates legacy raw localStorage strings to expiry schema", () => {
    localStorage.setItem("bb_active_room_id", "legacy-room");
    expect(getActiveRoomId()).toBe("legacy-room");

    const raw = localStorage.getItem("bb_active_room_id");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as {
      value: string;
      expiresAtMs: number;
    };
    expect(parsed.value).toBe("legacy-room");
    expect(typeof parsed.expiresAtMs).toBe("number");
  });

  it("clears expired entries", () => {
    const raw = JSON.stringify({
      value: "room-expired",
      expiresAtMs: Date.now() - 1,
    });
    localStorage.setItem("bb_active_room_id", raw);

    expect(getActiveRoomId()).toBeNull();
    expect(localStorage.getItem("bb_active_room_id")).toBeNull();
  });

  it("clears invalid expiry entries", () => {
    localStorage.setItem(
      "bb_active_room_id",
      JSON.stringify({ value: "x", expiresAtMs: 0 }),
    );
    expect(getActiveRoomId()).toBeNull();
    expect(localStorage.getItem("bb_active_room_id")).toBeNull();
  });
});

describe("getActiveRoomExpiresAtMs", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("derives expiry from started_at when available", () => {
    const room = {
      started_at: "2026-01-01T00:00:00.000Z",
      expires_at: "2026-01-01T00:01:00.000Z",
      questions_count: 10,
      time_per_question_sec: 10,
    } as unknown as Room;

    expect(getActiveRoomExpiresAtMs(room)).toBe(
      Date.parse("2026-01-01T00:01:40.000Z"),
    );
  });

  it("falls back to expires_at when started_at is not set", () => {
    const room = {
      started_at: null,
      expires_at: "2026-01-01T00:05:00.000Z",
      questions_count: 10,
      time_per_question_sec: 10,
    } as unknown as Room;

    expect(getActiveRoomExpiresAtMs(room)).toBe(
      Date.parse("2026-01-01T00:05:00.000Z"),
    );
  });
});
