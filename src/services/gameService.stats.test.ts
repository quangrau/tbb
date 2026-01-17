import { describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({}),
}));

describe("computePlayerPostGameStats", async () => {
  const { computePlayerPostGameStats } = await import("./gameService");

  it("returns zeros when there are no answers", () => {
    expect(computePlayerPostGameStats([])).toEqual({
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
      accuracyPercent: 0,
    });
  });

  it("classifies correct, wrong, and timeout answers", () => {
    const stats = computePlayerPostGameStats([
      { is_correct: true, selected_option_index: 1, answer_text: null },
      { is_correct: false, selected_option_index: null, answer_text: null },
      { is_correct: false, selected_option_index: 2, answer_text: null },
      { is_correct: false, selected_option_index: null, answer_text: "x" },
    ]);

    expect(stats.totalQuestions).toBe(4);
    expect(stats.correctCount).toBe(1);
    expect(stats.timeoutCount).toBe(1);
    expect(stats.wrongCount).toBe(2);
    expect(stats.accuracyPercent).toBe(25);
  });
});
