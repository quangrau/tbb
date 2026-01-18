import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import { Button } from "./ui/Button";

interface TextAnswerInputProps {
  unit?: string | null;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  showResult?: boolean;
  isCorrect?: boolean | null;
  submittedAnswer?: string | null;
}

export const TextAnswerInput = memo(function TextAnswerInput({
  unit,
  onSubmit,
  disabled = false,
  showResult = false,
  isCorrect = null,
  submittedAnswer = null,
}: TextAnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && !showResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, showResult]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled && !showResult) {
      onSubmit(trimmed);
    }
  }, [value, disabled, showResult, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const containerClasses = showResult
    ? isCorrect
      ? "bg-bb-primary text-white"
      : "bg-bb-danger text-white"
    : "bg-bb-surface text-bb-ink";

  const inputValue =
    showResult && submittedAnswer !== null ? submittedAnswer : value;

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center gap-3 p-4 rounded-bb-xl border-3 border-bb-ink ${containerClasses}`}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || showResult}
          placeholder={unit ? `Enter answer in ${unit}` : "Type your answer"}
          className="flex-1 bg-transparent border-none outline-none text-xl font-bold placeholder:text-bb-muted"
          autoComplete="off"
        />
        {unit && <span className="text-lg font-bold opacity-80">{unit}</span>}
      </div>

      {!showResult && !disabled && (
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
});
