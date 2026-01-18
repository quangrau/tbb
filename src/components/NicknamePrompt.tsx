import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { NICKNAME_MAX_LENGTH } from "../utils/constants";

interface NicknamePromptProps {
  onSubmit: (nickname: string) => void;
  initialValue?: string;
  isEdit?: boolean;
  onCancel?: () => void;
}

export function NicknamePrompt({
  onSubmit,
  initialValue = "",
  isEdit = false,
  onCancel,
}: NicknamePromptProps) {
  const [nickname, setNickname] = useState(initialValue);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("Please enter a nickname");
      return;
    }
    if (trimmed.length > NICKNAME_MAX_LENGTH) {
      setError(`Nickname must be ${NICKNAME_MAX_LENGTH} characters or less`);
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-bb-surface border-3 border-bb-ink rounded-bb-xl p-6 w-full max-w-sm shadow-bb-neo">
        <h2 className="text-xl font-bold font-display text-bb-ink mb-2">
          {isEdit ? "Edit Nickname" : "Welcome!"}
        </h2>
        <p className="text-bb-muted text-sm font-bold mb-4">
          {isEdit
            ? "Enter your new nickname"
            : "Enter a nickname to get started"}
        </p>

        <Input
          placeholder="Your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={NICKNAME_MAX_LENGTH}
          autoFocus
        />

        {error && (
          <p className="text-bb-danger text-sm font-bold mt-2">{error}</p>
        )}

        <div className="flex gap-2 mt-4">
          {isEdit && onCancel && (
            <Button variant="outline" fullWidth onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button fullWidth onClick={handleSubmit}>
            {isEdit ? "Save" : "Let's Go!"}
          </Button>
        </div>
      </div>
    </div>
  );
}
