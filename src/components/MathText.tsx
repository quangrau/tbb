import { memo, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  text: string;
  className?: string;
}

type Part = { type: "text" | "math"; content: string };

export const MathText = memo(function MathText({
  text,
  className = "",
}: MathTextProps) {
  const parts = useMemo<Part[]>(() => {
    const out: Part[] = [];
    const regex = /\$(.+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        out.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }

      try {
        out.push({
          type: "math",
          content: katex.renderToString(match[1], { throwOnError: false }),
        });
      } catch {
        out.push({ type: "text", content: match[0] });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      out.push({ type: "text", content: text.slice(lastIndex) });
    }

    return out;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.type === "math" ? (
          <span
            key={index}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        ) : (
          <span key={index}>{part.content}</span>
        ),
      )}
    </span>
  );
});
