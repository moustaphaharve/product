import * as React from "react";
import { cn } from "./cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showOverlay?: boolean;
}

export function Dialog({
  open,
  onClose,
  children,
  className,
  showOverlay = true,
}: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {showOverlay && (
        <button
          aria-label="Close dialog"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          "relative bg-bg-secondary border border-border-primary/50 rounded-xl shadow-2xl max-h-[85vh] overflow-hidden animate-fadeInUp",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
