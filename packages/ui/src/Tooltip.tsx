import * as React from "react";
import { cn } from "./cn";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delay?: number;
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = "right",
  delay = 400,
  className,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const timeout = React.useRef<number | null>(null);

  const onEnter = () => {
    if (timeout.current) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setVisible(true), delay);
  };
  const onLeave = () => {
    if (timeout.current) window.clearTimeout(timeout.current);
    setVisible(false);
  };

  const sideClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  }[side];

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 animate-fadeIn whitespace-nowrap rounded-md bg-bg-tertiary border border-border-primary/60 px-2 py-1 text-xs text-text-secondary shadow-lg",
            sideClass,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
