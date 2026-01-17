import { describe, expect, it } from "vitest";
import type { Player } from "../types";
import { ONLINE_THRESHOLD_MS, isPlayerOnline } from "./presence";

describe("isPlayerOnline", () => {
  it("returns false for invalid heartbeat timestamps", () => {
    const player = { last_heartbeat: "not-a-date" } as unknown as Player;
    expect(isPlayerOnline(player, Date.now())).toBe(false);
  });

  it("returns true when heartbeat is within threshold", () => {
    const nowMs = Date.parse("2026-01-01T00:00:30.000Z");
    const player = {
      last_heartbeat: "2026-01-01T00:00:00.000Z",
    } as unknown as Player;

    expect(isPlayerOnline(player, nowMs, ONLINE_THRESHOLD_MS)).toBe(true);
  });

  it("returns false when heartbeat is beyond threshold", () => {
    const nowMs = Date.parse("2026-01-01T00:01:00.000Z");
    const player = {
      last_heartbeat: "2026-01-01T00:00:00.000Z",
    } as unknown as Player;

    expect(isPlayerOnline(player, nowMs, 45_000)).toBe(false);
  });
});
