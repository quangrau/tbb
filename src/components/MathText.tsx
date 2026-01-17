import { memo, useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathTextProps {
  text: string
  className?: string
}

/**
 * Renders text with inline LaTeX math expressions.
 * Math expressions should be wrapped in $...$ delimiters.
 * Example: "The answer is $14 + 8 = 22$"
 */
export const MathText = memo(function MathText({ text, className = '' }: MathTextProps) {
  const rendered = useMemo(() => {
    // Replace $...$ with rendered math
    // Using a regex to find all math expressions
    const parts: Array<{ type: 'text' | 'math'; content: string }> = []
    let lastIndex = 0
    const regex = /\$(.+?)\$/g
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
      }

      // Add the math expression
      try {
        const mathHtml = katex.renderToString(match[1], {
          throwOnError: false,
          displayMode: false,
        })
        parts.push({ type: 'math', content: mathHtml })
      } catch {
        // If KaTeX fails, just show the raw text
        parts.push({ type: 'text', content: match[0] })
      }

      lastIndex = regex.lastIndex
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) })
    }

    return parts
  }, [text])

  return (
    <span className={className}>
      {rendered.map((part, index) =>
        part.type === 'math' ? (
          <span
            key={index}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        ) : (
          <span key={index}>{part.content}</span>
        )
      )}
    </span>
  )
})
