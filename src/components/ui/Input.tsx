import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-bb-ink text-sm font-bold mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-bb-surface border-3 border-bb-ink rounded-bb-lg text-bb-ink placeholder:text-bb-muted focus-visible:outline-none transition-colors ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-bb-danger text-sm font-bold">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
