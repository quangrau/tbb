import { memo, useCallback } from "react";

interface OptionButtonProps {
  label: string;
  index: number;
  onSelectOption: (index: number) => void;
  disabled?: boolean;
  selected?: boolean;
  isCorrect?: boolean | null;
  showResult?: boolean;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export const OptionButton = memo(function OptionButton({
  label,
  index,
  onSelectOption,
  disabled = false,
  selected = false,
  isCorrect = null,
  showResult = false,
}: OptionButtonProps) {
  let bgColor = "bg-bb-surface hover:bg-bb-secondaryHover";
  let borderColor = "border-bb-ink";
  let textColor = "text-bb-ink";
  let badgeColor = "bg-bb-secondary text-bb-ink";

  const handleClick = useCallback(() => {
    onSelectOption(index);
  }, [index, onSelectOption]);

  if (showResult) {
    if (isCorrect === true) {
      bgColor = "bg-bb-primary";
      borderColor = "border-bb-ink";
      textColor = "text-white";
      badgeColor = "bg-bb-surface text-bb-ink";
    } else if (isCorrect === false && selected) {
      bgColor = "bg-bb-danger";
      borderColor = "border-bb-ink";
      textColor = "text-white";
      badgeColor = "bg-bb-surface text-bb-ink";
    }
  } else if (selected) {
    bgColor = "bg-bb-secondary";
    borderColor = "border-bb-ink";
    badgeColor = "bg-bb-surface text-bb-ink";
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full p-4 rounded-bb-lg border-3 transition-colors duration-200
        flex items-center gap-4 text-left
        ${bgColor} ${borderColor} ${textColor}
        ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-3 border-bb-ink
          ${badgeColor}
        `}
      >
        {OPTION_LETTERS[index]}
      </span>
      <span className="text-lg font-bold flex-1">{label}</span>
    </button>
  );
});
