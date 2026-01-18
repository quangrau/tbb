import { describe, expect, it } from "vitest";
import { ROOM_CODE_CHARS, ROOM_CODE_LENGTH } from "./constants";
import { generateRoomCode } from "./generateRoomCode";

describe("generateRoomCode", () => {
  it("generates a code with correct length and allowed characters", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode();
      expect(code).toHaveLength(ROOM_CODE_LENGTH);
      for (const ch of code) {
        expect(ROOM_CODE_CHARS.includes(ch)).toBe(true);
      }
    }
  });
});

