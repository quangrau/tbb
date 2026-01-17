import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl ${className}`}>
      {children}
    </div>
  )
}
