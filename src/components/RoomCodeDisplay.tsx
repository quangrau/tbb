import { useState } from "react";

interface RoomCodeDisplayProps {
  code: string;
}

export function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="text-center">
      <p className="text-bb-muted text-sm mb-2 font-bold">Room Code</p>
      <button
        onClick={handleCopy}
        className="group relative bg-bb-surface hover:bg-bb-secondary rounded-bb-lg border-3 border-bb-ink px-6 py-4 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bb-line focus-visible:ring-offset-2 focus-visible:ring-offset-bb-bg cursor-pointer"
      >
        <span className="text-3xl font-mono font-bold text-bb-ink tracking-[0.2em]">
          {code}
        </span>
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-bb-muted font-bold">
          {copied ? "Copied!" : "Click to copy"}
        </span>
      </button>
    </div>
  );
}
