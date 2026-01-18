import { describe, expect, it } from "vitest";
import { isPlayerOnline, ONLINE_THRESHOLD_MS } from "./presence";
import type { Player } from "../types";

describe("presence", () => {
  it("treats invalid heartbeat as offline", () => {
    const player = { last_heartbeat: "not-a-date" } as unknown as Player;
    expect(isPlayerOnline(player, Date.now())).toBe(false);
  });

  it("treats player as online within threshold", () => {
    const nowMs = Date.UTC(2020, 0, 1, 0, 0, 45);
    const heartbeat = new Date(nowMs - ONLINE_THRESHOLD_MS + 1).toISOString();
    const player = { last_heartbeat: heartbeat } as unknown as Player;
    expect(isPlayerOnline(player, nowMs)).toBe(true);
  });

  it("treats player as offline beyond threshold", () => {
    const nowMs = Date.UTC(2020, 0, 1, 0, 0, 45);
    const heartbeat = new Date(nowMs - ONLINE_THRESHOLD_MS - 1).toISOString();
    const player = { last_heartbeat: heartbeat } as unknown as Player;
    expect(isPlayerOnline(player, nowMs)).toBe(false);
  });
});
