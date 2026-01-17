import { describe, expect, it } from "vitest";
import type { Question } from "../types";
import {
  parseNumericValue,
  validateAnswer,
  validateFreeFormAnswer,
} from "./answerValidation";

describe("parseNumericValue", () => {
  it("returns null for empty input", () => {
    expect(parseNumericValue("")).toBeNull();
    expect(parseNumericValue("   ")).toBeNull();
  });

  it("parses integers and decimals", () => {
    expect(parseNumericValue("22")).toBe(22);
    expect(parseNumericValue("  22.5 ")).toBe(22.5);
  });

  it("parses fractions", () => {
    expect(parseNumericValue("1/2")).toBe(0.5);
    expect(parseNumericValue(" 3 / 4 ")).toBe(0.75);
  });

  it("rejects invalid fractions", () => {
    expect(parseNumericValue("1/0")).toBeNull();
    expect(parseNumericValue("1/2/3")).toBeNull();
    expect(parseNumericValue("a/b")).toBeNull();
  });
});

describe("validateFreeFormAnswer", () => {
  it("validates numeric free-form answers using epsilon comparison", () => {
    const question = {
      question_type: "free_form",
      answer_type: "decimal",
      correct_answer: "0.5",
      acceptable_answers: null,
    } as unknown as Question;

    expect(validateFreeFormAnswer("0.5", question)).toBe(true);
    expect(validateFreeFormAnswer("1/2", question)).toBe(true);
    expect(validateFreeFormAnswer("0.50009", question)).toBe(true);
    expect(validateFreeFormAnswer("0.5002", question)).toBe(false);
  });

  it("validates numeric answers using acceptable_answers", () => {
    const question = {
      question_type: "free_form",
      answer_type: "fraction",
      correct_answer: "0.25",
      acceptable_answers: ["1/4", "0.2500"],
    } as unknown as Question;

    expect(validateFreeFormAnswer("1/4", question)).toBe(true);
    expect(validateFreeFormAnswer("0.25", question)).toBe(true);
  });

  it("validates text answers case-insensitively", () => {
    const question = {
      question_type: "free_form",
      answer_type: "text",
      correct_answer: "Hello",
      acceptable_answers: ["Hi"],
    } as unknown as Question;

    expect(validateFreeFormAnswer("hello", question)).toBe(true);
    expect(validateFreeFormAnswer("  HI  ", question)).toBe(true);
    expect(validateFreeFormAnswer("nope", question)).toBe(false);
  });
});

describe("validateAnswer", () => {
  it("validates multiple choice answers by index", () => {
    const question = {
      question_type: "multiple_choice",
      correct_option_index: 2,
    } as unknown as Question;

    expect(validateAnswer(question, 2, null)).toBe(true);
    expect(validateAnswer(question, 1, null)).toBe(false);
    expect(validateAnswer(question, null, null)).toBe(false);
  });

  it("routes free-form answers through validateFreeFormAnswer", () => {
    const question = {
      question_type: "free_form",
      answer_type: "integer",
      correct_answer: "10",
      acceptable_answers: null,
    } as unknown as Question;

    expect(validateAnswer(question, null, "10")).toBe(true);
    expect(validateAnswer(question, null, "11")).toBe(false);
    expect(validateAnswer(question, null, null)).toBe(false);
  });
});
