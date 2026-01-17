import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Player, Question } from "../types";

vi.mock("../services/gameService", () => ({
  fetchQuestionsByIds: vi.fn(),
  submitAnswer: vi.fn(),
  markPlayerFinished: vi.fn(),
  checkAllPlayersFinished: vi.fn(),
  markRoomFinished: vi.fn(),
}));

vi.mock("../services/realtimeService", () => ({
  subscribeToGameProgress: vi.fn(() => ({
    channel: {} as never,
    unsubscribe: vi.fn(),
  })),
}));

import { useGameStore } from "./gameStore";
import * as gameService from "../services/gameService";
import * as realtimeService from "../services/realtimeService";

function makeQuestion(overrides?: Partial<Question>): Question {
  return {
    id: "q1",
    grade: 3,
    term: 1,
    question_text: "1+1?",
    options: ["2", "3"],
    correct_option_index: 0,
    explanation: "Because",
    created_at: "2025-01-01T00:00:00.000Z",
    question_type: "multiple_choice",
    correct_answer: null,
    acceptable_answers: null,
    answer_unit: null,
    answer_type: "integer",
    ...overrides,
  };
}

function makePlayer(overrides?: Partial<Player>): Player {
  return {
    id: "player_1",
    room_id: "room_1",
    device_id: "device_1",
    nickname: "Alice",
    is_ready: false,
    is_finished: false,
    current_question_index: 0,
    score: 0,
    total_time_ms: 0,
    joined_at: "2025-01-01T00:00:00.000Z",
    finished_at: null,
    last_heartbeat: "2025-01-01T00:00:00.000Z",
    is_owner: false,
    ...overrides,
  };
}

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    vi.clearAllMocks();
  });

  it("loadQuestions sets questions", async () => {
    const questions = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })];
    vi.mocked(gameService.fetchQuestionsByIds).mockResolvedValue(questions);

    await useGameStore.getState().loadQuestions(["q1", "q2"]);

    expect(useGameStore.getState().questions.map((q) => q.id)).toEqual([
      "q1",
      "q2",
    ]);
  });

  it("loadQuestions throws and sets error on failure", async () => {
    vi.mocked(gameService.fetchQuestionsByIds).mockRejectedValue(
      new Error("boom"),
    );

    await expect(useGameStore.getState().loadQuestions(["q1"])).rejects.toThrow(
      "boom",
    );

    expect(useGameStore.getState().error).toBe("boom");
  });

  it("hydrateFromPlayer clamps question index", () => {
    useGameStore.setState({
      questions: [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })],
    });

    useGameStore
      .getState()
      .hydrateFromPlayer(makePlayer({ current_question_index: 999, score: 2 }));
    expect(useGameStore.getState().currentQuestionIndex).toBe(1);
    expect(useGameStore.getState().score).toBe(2);

    useGameStore
      .getState()
      .hydrateFromPlayer(makePlayer({ current_question_index: -10, score: 1 }));
    expect(useGameStore.getState().currentQuestionIndex).toBe(0);
    expect(useGameStore.getState().score).toBe(1);
  });

  it("submitAnswer returns false when there is no current question", async () => {
    useGameStore.setState({ questions: [] });
    expect(
      await useGameStore
        .getState()
        .submitAnswer("room_1", "player_1", 0, null, 1000),
    ).toBe(false);
    expect(gameService.submitAnswer).not.toHaveBeenCalled();
  });

  it("submitAnswer updates score and total time", async () => {
    useGameStore.setState({
      questions: [makeQuestion()],
      currentQuestionIndex: 0,
    });
    vi.mocked(gameService.submitAnswer).mockResolvedValue({
      isCorrect: true,
      newScore: 3,
      newTotalTimeMs: 900,
    });

    const ok = await useGameStore
      .getState()
      .submitAnswer("room_1", "player_1", 0, null, 900);

    expect(ok).toBe(true);
    expect(useGameStore.getState().score).toBe(3);
    expect(useGameStore.getState().totalTimeMs).toBe(900);
    expect(useGameStore.getState().lastAnswerCorrect).toBe(true);
  });

  it("nextQuestion advances and clears lastAnswerCorrect", () => {
    useGameStore.setState({
      questions: [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })],
      currentQuestionIndex: 0,
      lastAnswerCorrect: true,
    });

    useGameStore.getState().nextQuestion();

    expect(useGameStore.getState().currentQuestionIndex).toBe(1);
    expect(useGameStore.getState().lastAnswerCorrect).toBeNull();

    useGameStore.getState().nextQuestion();
    expect(useGameStore.getState().currentQuestionIndex).toBe(1);
  });

  it("finishGame marks room finished when all players finished", async () => {
    vi.mocked(gameService.markPlayerFinished).mockResolvedValue(undefined);
    vi.mocked(gameService.checkAllPlayersFinished).mockResolvedValue(true);
    vi.mocked(gameService.markRoomFinished).mockResolvedValue(undefined);

    await useGameStore.getState().finishGame("room_1", "player_1");

    expect(gameService.markPlayerFinished).toHaveBeenCalledWith("player_1");
    expect(gameService.markRoomFinished).toHaveBeenCalledWith("room_1");
    expect(useGameStore.getState().isFinished).toBe(true);
    expect(useGameStore.getState().isWaitingForOthers).toBe(false);
  });

  it("subscribeToProgress clears waiting state when all players finished", () => {
    const unsubscribe = vi.fn();
    vi.mocked(realtimeService.subscribeToGameProgress).mockReturnValue({
      channel: {} as never,
      unsubscribe,
    });

    useGameStore.setState({ isFinished: true, isWaitingForOthers: true });
    const stop = useGameStore.getState().subscribeToProgress("room_1");

    const callback = vi.mocked(realtimeService.subscribeToGameProgress).mock
      .calls[0]?.[1];
    expect(typeof callback).toBe("function");

    callback?.([
      makePlayer({ id: "p1", is_finished: true }),
      makePlayer({ id: "p2", is_finished: true }),
    ]);

    expect(useGameStore.getState().isWaitingForOthers).toBe(false);
    expect(stop).toBe(unsubscribe);
  });
});
