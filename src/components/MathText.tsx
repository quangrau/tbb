import { memo, useEffect, useMemo, useState } from "react";

interface MathTextProps {
  text: string;
  className?: string;
}

type KatexModule = {
  renderToString: (input: string, options: Record<string, unknown>) => string;
};

let katexLoadPromise: Promise<KatexModule> | null = null;

async function loadKatex(): Promise<KatexModule> {
  if (!katexLoadPromise) {
    katexLoadPromise = Promise.all([
      import("katex"),
      import("katex/dist/katex.min.css"),
    ]).then(([katexModule]) => {
      const katex = (katexModule as unknown as { default?: KatexModule })
        .default;
      return katex ?? (katexModule as unknown as KatexModule);
    });
  }

  return katexLoadPromise;
}

/**
 * Renders text with inline LaTeX math expressions.
 * Math expressions should be wrapped in $...$ delimiters.
 * Example: "The answer is $14 + 8 = 22$"
 */
export const MathText = memo(function MathText({
  text,
  className = "",
}: MathTextProps) {
  const [katex, setKatex] = useState<KatexModule | null>(null);

  const hasMath = useMemo(() => /\$(.+?)\$/.test(text), [text]);

  useEffect(() => {
    if (!hasMath || katex) return;

    let cancelled = false;
    loadKatex()
      .then((loadedKatex) => {
        if (cancelled) return;
        setKatex(loadedKatex);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [hasMath, katex]);

  const rendered = useMemo(() => {
    if (!hasMath || !katex) return [{ type: "text", content: text }] as const;

    const parts: Array<{ type: "text" | "math"; content: string }> = [];
    let lastIndex = 0;
    const regex = /\$(.+?)\$/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }

      try {
        const mathHtml = katex.renderToString(match[1] ?? "", {
          throwOnError: false,
          displayMode: false,
        });
        parts.push({ type: "math", content: mathHtml });
      } catch {
        parts.push({ type: "text", content: match[0] });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.slice(lastIndex) });
    }

    return parts;
  }, [hasMath, katex, text]);

  return (
    <span className={className}>
      {rendered.map((part, index) =>
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
