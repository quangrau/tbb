import { describe, expect, it } from "vitest";
import { ROOM_CODE_CHARS, ROOM_CODE_LENGTH } from "./constants";
import { generateRoomCode } from "./generateRoomCode";

describe("generateRoomCode", () => {
  it("generates a code with the expected length", () => {
    expect(generateRoomCode()).toHaveLength(ROOM_CODE_LENGTH);
  });

  it("generates a code using only allowed characters", () => {
    const code = generateRoomCode();
    for (const char of code) {
      expect(ROOM_CODE_CHARS.includes(char)).toBe(true);
    }
  });
});
