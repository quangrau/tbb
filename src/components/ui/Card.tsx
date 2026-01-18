import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-bb-surface border-3 border-bb-ink rounded-bb-xl p-6 shadow-bb-neo ${className}`}
    >
      {children}
    </div>
  );
}
