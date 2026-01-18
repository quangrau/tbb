import { describe, expect, it } from "vitest";
import {
  parseNumericValue,
  validateAnswer,
  validateFreeFormAnswer,
} from "./answerValidation";
import type { Question } from "../types";

describe("parseNumericValue", () => {
  it("parses integers and decimals", () => {
    expect(parseNumericValue("22")).toBe(22);
    expect(parseNumericValue("  22.5 ")).toBe(22.5);
  });

  it("parses fractions", () => {
    expect(parseNumericValue("1/2")).toBeCloseTo(0.5);
    expect(parseNumericValue(" 3 / 4 ")).toBeCloseTo(0.75);
  });

  it("returns null for invalid inputs", () => {
    expect(parseNumericValue("")).toBeNull();
    expect(parseNumericValue("x")).toBeNull();
    expect(parseNumericValue("1/0")).toBeNull();
    expect(parseNumericValue("1/2/3")).toBeNull();
  });
});

describe("validateFreeFormAnswer", () => {
  it("validates numeric answers using epsilon comparison", () => {
    const question = {
      question_type: "free_form",
      answer_type: "decimal",
      correct_answer: "0.5",
      acceptable_answers: [],
    } as unknown as Question;

    expect(validateFreeFormAnswer("1/2", question)).toBe(true);
    expect(validateFreeFormAnswer("0.50001", question)).toBe(true);
    expect(validateFreeFormAnswer("0.6", question)).toBe(false);
  });

  it("supports acceptable_answers for numeric alternatives", () => {
    const question = {
      question_type: "free_form",
      answer_type: "fraction",
      correct_answer: "2/4",
      acceptable_answers: ["0.5", "1/2"],
    } as unknown as Question;

    expect(validateFreeFormAnswer("0.5", question)).toBe(true);
    expect(validateFreeFormAnswer("1/2", question)).toBe(true);
    expect(validateFreeFormAnswer("0.25", question)).toBe(false);
  });

  it("validates text answers case-insensitively", () => {
    const question = {
      question_type: "free_form",
      answer_type: "text",
      correct_answer: "Hello",
      acceptable_answers: ["hi"],
    } as unknown as Question;

    expect(validateFreeFormAnswer(" hello ", question)).toBe(true);
    expect(validateFreeFormAnswer("HI", question)).toBe(true);
    expect(validateFreeFormAnswer("bye", question)).toBe(false);
  });
});

describe("validateAnswer", () => {
  it("validates multiple choice by index", () => {
    const question = {
      question_type: "multiple_choice",
      correct_option_index: 2,
    } as unknown as Question;

    expect(validateAnswer(question, 2, null)).toBe(true);
    expect(validateAnswer(question, 1, null)).toBe(false);
    expect(validateAnswer(question, null, null)).toBe(false);
  });

  it("delegates free-form validation when question_type is free_form", () => {
    const question = {
      question_type: "free_form",
      answer_type: "integer",
      correct_answer: "10",
      acceptable_answers: [],
    } as unknown as Question;

    expect(validateAnswer(question, null, "10")).toBe(true);
    expect(validateAnswer(question, null, "11")).toBe(false);
    expect(validateAnswer(question, null, null)).toBe(false);
  });
});
