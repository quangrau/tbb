import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-display font-bold rounded-bb-lg border-3 border-bb-ink transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bb-line focus-visible:ring-offset-2 focus-visible:ring-offset-bb-bg";

  const variantStyles = {
    primary:
      "bg-bb-primary hover:bg-bb-primaryHover text-white shadow-bb-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-bb-press",
    secondary: "bg-bb-secondary hover:bg-bb-secondaryHover text-bb-ink",
    outline: "bg-bb-surface hover:bg-bb-secondary text-bb-ink",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm min-h-11",
    md: "px-6 py-3 text-lg min-h-12",
    lg: "px-8 py-4 text-xl min-h-14",
  };

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed active:translate-x-0 active:translate-y-0 active:shadow-none"
    : "cursor-pointer";
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
