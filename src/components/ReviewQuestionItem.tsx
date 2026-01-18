import { useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { MathText } from "./MathText";
import type { AnswerWithQuestion, ReportPayload } from "../types/review.ts";

function parseOptions(optionsRaw: unknown): string[] {
  if (!optionsRaw) return [];
  if (Array.isArray(optionsRaw)) {
    return optionsRaw.filter(
      (option): option is string => typeof option === "string",
    );
  }
  if (typeof optionsRaw === "string") {
    try {
      const parsed: unknown = JSON.parse(optionsRaw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (option): option is string => typeof option === "string",
      );
    } catch {
      return [];
    }
  }
  return [];
}

function formatTimeMs(timeMs: number): string {
  const seconds = Math.round(timeMs / 1000);
  return `${seconds}s`;
}

function isTimeout(item: AnswerWithQuestion): boolean {
  return (
    item.answer.selected_option_index === null &&
    item.answer.answer_text === null
  );
}

function answerBadge(item: AnswerWithQuestion): {
  label: string;
  className: string;
} {
  if (isTimeout(item)) {
    return { label: "No answer", className: "bg-bb-surface text-bb-muted" };
  }
  if (item.answer.is_correct) {
    return { label: "Correct", className: "bg-bb-primary text-white" };
  }
  return { label: "Wrong", className: "bg-bb-danger text-white" };
}

function buildCorrectAnswerLabel(
  item: AnswerWithQuestion,
  options: string[],
): string {
  if (item.question.question_type === "multiple_choice") {
    const idx = item.question.correct_option_index;
    if (idx === null || idx === undefined) return "—";
    return options[idx] ?? "—";
  }

  const acceptable = item.question.acceptable_answers ?? [];
  const correct = item.question.correct_answer;
  const base =
    correct ?? (acceptable.length > 0 ? acceptable.join(" / ") : "—");
  return item.question.answer_unit
    ? `${base} ${item.question.answer_unit}`
    : base;
}

function buildYourAnswerLabel(
  item: AnswerWithQuestion,
  options: string[],
): string {
  if (isTimeout(item)) return "—";

  if (item.question.question_type === "multiple_choice") {
    const idx = item.answer.selected_option_index;
    if (idx === null || idx === undefined) return "—";
    return options[idx] ?? "—";
  }

  const answer = item.answer.answer_text ?? "—";
  return item.question.answer_unit
    ? `${answer} ${item.question.answer_unit}`
    : answer;
}

export function ReviewQuestionItem({
  item,
  index,
  isReported,
  reportTypes,
  onReport,
}: {
  item: AnswerWithQuestion;
  index: number;
  isReported: boolean;
  reportTypes: string[];
  onReport: (payload: ReportPayload) => Promise<void>;
}) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState(reportTypes[0] ?? "other");
  const [reportText, setReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(
    () => parseOptions(item.question.options),
    [item.question.options],
  );

  const badge = answerBadge(item);
  const hasNoAnswer = isTimeout(item);
  const questionNumber = item.answer.question_index + 1;
  const correctAnswerLabel = useMemo(
    () => buildCorrectAnswerLabel(item, options),
    [item, options],
  );
  const yourAnswerLabel = useMemo(
    () => buildYourAnswerLabel(item, options),
    [item, options],
  );

  return (
    <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-bb-ink font-bold">
            Q{questionNumber}
            <span className="text-bb-muted text-sm ml-2 font-bold">
              (#{index + 1} in this filter)
            </span>
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${badge.className}`}
        >
          {badge.label}
        </div>
      </div>

      <div className="bg-bb-secondary border-3 border-bb-ink rounded-bb-lg p-3">
        <p className="text-bb-ink font-bold">
          <MathText text={item.question.question_text} />
        </p>
      </div>

      <div className="grid gap-1 text-sm">
        <p className="text-bb-muted font-bold">
          Your answer:{" "}
          {hasNoAnswer ? (
            <span className="text-bb-muted">No answer</span>
          ) : (
            <span className="text-bb-ink">{yourAnswerLabel}</span>
          )}
        </p>
        <p className="text-bb-muted font-bold">
          Correct answer:{" "}
          <span className="text-bb-ink">{correctAnswerLabel}</span>
        </p>
        <p className="text-bb-muted font-bold">
          Time:{" "}
          <span className="text-bb-ink">
            {formatTimeMs(item.answer.answer_time_ms)}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExplanationOpen((v) => !v)}
        >
          {isExplanationOpen ? "Hide explanation" : "Show explanation"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isReported}
          onClick={() => setIsReportOpen((v) => !v)}
        >
          {isReported
            ? "Reported"
            : isReportOpen
              ? "Cancel report"
              : "Report issue"}
        </Button>
      </div>

      {isExplanationOpen && (
        <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-3">
          <p className="text-bb-muted text-sm font-bold mb-2">Explanation</p>
          <p className="text-bb-ink text-sm font-bold whitespace-pre-wrap">
            {item.question.explanation}
          </p>
        </div>
      )}
      {!isReported && isReportOpen && (
        <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-lg p-3 space-y-3">
          {error && <p className="text-bb-danger text-sm font-bold">{error}</p>}

          <div className="grid gap-2">
            <label className="text-bb-ink text-sm font-bold">
              What is wrong?
            </label>
            <select
              className="w-full px-4 py-3 bg-bb-surface border-3 border-bb-ink rounded-bb-lg text-bb-ink focus-visible:outline-none transition-colors"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-bb-ink text-sm font-bold">
              Details (optional)
            </label>
            <textarea
              className="w-full px-4 py-3 bg-bb-surface border-3 border-bb-ink rounded-bb-lg text-bb-ink placeholder:text-bb-muted focus-visible:outline-none transition-colors min-h-24"
              placeholder="Explain what you think is wrong..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              maxLength={500}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              setError(null);
              try {
                await onReport({ reportType, reportText });
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Failed to submit report",
                );
                setIsSubmitting(false);
                return;
              }
              setIsSubmitting(false);
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit report"}
          </Button>
        </div>
      )}
    </div>
  );
}
