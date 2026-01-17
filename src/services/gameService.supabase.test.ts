import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Player, Question } from "../types";

type SupabaseResult = { data: unknown; error: unknown };
type SupabaseResultQueue = Array<SupabaseResult>;

function createSupabaseMock() {
  const queues = new Map<string, SupabaseResultQueue>();
  const calls: Array<{ table: string; method: string; args: unknown[] }> = [];

  type Builder = PromiseLike<SupabaseResult> & {
    select: (...args: unknown[]) => Builder;
    insert: (...args: unknown[]) => Builder;
    update: (...args: unknown[]) => Builder;
    delete: (...args: unknown[]) => Builder;
    eq: (...args: unknown[]) => Builder;
    in: (...args: unknown[]) => Builder;
    order: (...args: unknown[]) => Builder;
    single: (...args: unknown[]) => Builder;
  };

  const pushResult = (
    table: string,
    method: string,
    result: SupabaseResult,
  ) => {
    const key = `${table}:${method}`;
    const next = queues.get(key) ?? [];
    next.push(result);
    queues.set(key, next);
  };

  const reset = () => {
    queues.clear();
    calls.length = 0;
  };

  const from = vi.fn((table: string) => {
    const state = { table, op: "select" };

    const builder = {} as Builder;

    builder.select = (...args: unknown[]) => {
      state.op = "select";
      calls.push({ table, method: "select", args });
      return builder;
    };

    builder.insert = (...args: unknown[]) => {
      state.op = "insert";
      calls.push({ table, method: "insert", args });
      return builder;
    };

    builder.update = (...args: unknown[]) => {
      state.op = "update";
      calls.push({ table, method: "update", args });
      return builder;
    };

    builder.delete = (...args: unknown[]) => {
      state.op = "delete";
      calls.push({ table, method: "delete", args });
      return builder;
    };

    builder.eq = (...args: unknown[]) => {
      calls.push({ table, method: "eq", args });
      return builder;
    };

    builder.in = (...args: unknown[]) => {
      calls.push({ table, method: "in", args });
      return builder;
    };

    builder.order = (...args: unknown[]) => {
      calls.push({ table, method: "order", args });
      return builder;
    };

    builder.single = (...args: unknown[]) => {
      calls.push({ table, method: "single", args });
      return builder;
    };

    builder.then = <TResult1 = SupabaseResult, TResult2 = never>(
      onfulfilled?:
        | ((value: SupabaseResult) => TResult1 | PromiseLike<TResult1>)
        | null
        | undefined,
      onrejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null
        | undefined,
    ): PromiseLike<TResult1 | TResult2> => {
      const key = `${state.table}:${state.op}`;
      const queue = queues.get(key) ?? [];
      const result = queue.shift() ?? { data: null, error: null };
      queues.set(key, queue);
      return Promise.resolve(result).then(onfulfilled, onrejected);
    };

    return builder;
  });

  return {
    supabase: { from },
    calls,
    pushResult,
    reset,
  };
}

const supabaseMock = vi.hoisted(() => createSupabaseMock());

vi.mock("../config/supabase", () => ({ supabase: supabaseMock.supabase }));

import {
  fetchPlayerReviewItemsForAllQuestions,
  fetchRoomResultsWithDerivedStats,
  forceFinishUnfinishedPlayers,
} from "./gameService";

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

describe("gameService with mocked supabase", () => {
  beforeEach(() => {
    supabaseMock.reset();
    vi.useRealTimers();
  });

  it("fetchPlayerReviewItemsForAllQuestions synthesizes missing answers as timeouts", async () => {
    const roomId = "room_1";
    const playerId = "player_1";
    const questionIds = ["q1", "q2", "q3"];

    const q1 = makeQuestion({ id: "q1" });
    const q2 = makeQuestion({ id: "q2" });
    const q3 = makeQuestion({ id: "q3" });

    supabaseMock.pushResult("questions", "select", {
      data: [q2, q3, q1],
      error: null,
    });

    supabaseMock.pushResult("answers", "select", {
      data: [
        {
          id: "a2",
          room_id: roomId,
          player_id: playerId,
          question_id: "q2",
          question_index: 1,
          selected_option_index: 0,
          answer_text: null,
          is_correct: true,
          answer_time_ms: 800,
          answered_at: "2025-01-01T00:00:10.000Z",
        },
      ],
      error: null,
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:30.000Z"));

    const items = await fetchPlayerReviewItemsForAllQuestions({
      roomId,
      playerId,
      questionIds,
      timePerQuestionSec: 5,
    });

    expect(items).toHaveLength(3);
    expect(items.map((i) => i.question.id)).toEqual(["q1", "q2", "q3"]);
    expect(items[1]?.answer.id).toBe("a2");
    expect(items[0]?.answer.selected_option_index).toBeNull();
    expect(items[0]?.answer.answer_text).toBeNull();
    expect(items[0]?.answer.is_correct).toBe(false);
    expect(items[0]?.answer.answer_time_ms).toBe(5000);
    expect(items[0]?.answer.answered_at).toBe("2025-01-01T00:00:30.000Z");
  });

  it("fetchRoomResultsWithDerivedStats attaches computed stats per player", async () => {
    const roomId = "room_1";
    const p1 = makePlayer({ id: "p1" });
    const p2 = makePlayer({ id: "p2" });

    supabaseMock.pushResult("room_players", "select", {
      data: [p1, p2],
      error: null,
    });

    supabaseMock.pushResult("answers", "select", {
      data: [
        {
          player_id: "p1",
          is_correct: true,
          selected_option_index: 0,
          answer_text: null,
        },
        {
          player_id: "p1",
          is_correct: false,
          selected_option_index: null,
          answer_text: null,
        },
      ],
      error: null,
    });

    const result = await fetchRoomResultsWithDerivedStats(roomId);
    expect(result).toHaveLength(2);

    const r1 = result.find((p) => p.id === "p1");
    expect(r1?.stats).toEqual({
      totalQuestions: 2,
      correctCount: 1,
      wrongCount: 0,
      timeoutCount: 1,
      accuracyPercent: 50,
    });

    const r2 = result.find((p) => p.id === "p2");
    expect(r2?.stats).toEqual({
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
      accuracyPercent: 0,
    });
  });

  it("forceFinishUnfinishedPlayers applies time penalties and marks players finished", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:30.000Z"));

    supabaseMock.pushResult("room_players", "select", {
      data: [
        { id: "p1", current_question_index: 3, total_time_ms: 1000 },
        { id: "p2", current_question_index: 10, total_time_ms: 500 },
      ],
      error: null,
    });

    supabaseMock.pushResult("room_players", "update", {
      data: null,
      error: null,
    });
    supabaseMock.pushResult("room_players", "update", {
      data: null,
      error: null,
    });

    await forceFinishUnfinishedPlayers({
      roomId: "room_1",
      questionsCount: 10,
      timePerQuestionSec: 2,
    });

    const updateCalls = supabaseMock.calls.filter(
      (c) => c.table === "room_players" && c.method === "update",
    );
    expect(updateCalls).toHaveLength(2);

    expect(updateCalls[0]?.args[0]).toEqual({
      is_finished: true,
      finished_at: "2025-01-01T00:00:30.000Z",
      current_question_index: 10,
      total_time_ms: 15000,
    });

    expect(updateCalls[1]?.args[0]).toEqual({
      is_finished: true,
      finished_at: "2025-01-01T00:00:30.000Z",
      current_question_index: 10,
      total_time_ms: 500,
    });
  });
});
