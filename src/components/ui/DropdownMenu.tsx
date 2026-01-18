import { ReactNode, useEffect } from "react";

type DropdownAlign = "left" | "right" | "center";

interface DropdownMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: DropdownAlign;
  trigger: ReactNode;
  panelClassName?: string;
  children: ReactNode;
}

export function DropdownMenu({
  open,
  onOpenChange,
  align = "left",
  trigger,
  panelClassName = "",
  children,
}: DropdownMenuProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const alignClass =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div className="relative">
      {trigger}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => onOpenChange(false)}
          />
          <div
            className={`absolute top-full mt-2 bg-bb-surface border-3 border-bb-ink rounded-bb-lg shadow-bb-neo overflow-hidden z-50 ${alignClass} ${panelClassName}`}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

