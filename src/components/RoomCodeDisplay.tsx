import { useState } from 'react'

interface RoomCodeDisplayProps {
  code: string
}

export function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="text-center">
      <p className="text-white/70 text-sm mb-2">Room Code</p>
      <button
        onClick={handleCopy}
        className="group relative bg-white/20 hover:bg-white/30 rounded-xl px-6 py-4 transition-all"
      >
        <span className="text-3xl font-mono font-bold text-white tracking-[0.2em]">
          {code}
        </span>
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60">
          {copied ? 'Copied!' : 'Click to copy'}
        </span>
      </button>
    </div>
  )
}
