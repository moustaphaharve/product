import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@product/ui";
import type { MessageActivity } from "@product/types";

/**
 * The single most important UX element besides the viewport.
 *
 * Shows:
 * - a pulsating dot while thinking/generating
 * - a live-updating label as the AI progresses
 * - a chevron revealing per-step completions ("Thought for 12s", etc.)
 * - a checkmark on completion; a clean error state on failure
 *
 * There is no time limit: whatever the operation takes, we show the
 * phase accurately. The user always knows: something is happening,
 * what specifically, and that it has not failed.
 */
export function ActivityIndicator({ activity }: { activity: MessageActivity }) {
  const [open, setOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (activity.status === "complete" || activity.status === "error") return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [activity.status]);

  const isActive =
    activity.status === "thinking" || activity.status === "generating";

  return (
    <div className="rounded-md border border-border-primary/50 bg-bg-tertiary/60 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-accent-subtle transition-colors duration-micro text-left"
      >
        <StatusGlyph status={activity.status} />
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-[13px]",
              isActive ? "text-text-primary" : "text-text-secondary",
            )}
          >
            {activity.label}
            {isActive && elapsed > 0 && (
              <span className="ml-1.5 text-text-tertiary font-mono text-[11px]">
                {elapsed}s
              </span>
            )}
          </div>
        </div>
        {activity.steps.length > 0 && (
          <span className="text-text-tertiary">
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && activity.steps.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border-primary/50"
          >
            <div className="p-2.5 flex flex-col gap-1.5">
              {activity.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Check size={11} className="text-semantic-success" />
                  <span className="text-text-secondary">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {activity.status === "error" && activity.errorMessage && (
        <div className="px-2.5 py-1.5 text-xs text-semantic-danger border-t border-border-primary/50">
          {activity.errorMessage}
        </div>
      )}
    </div>
  );
}

function StatusGlyph({ status }: { status: MessageActivity["status"] }) {
  if (status === "complete")
    return <Check size={13} className="text-semantic-success shrink-0" />;
  if (status === "error")
    return <AlertCircle size={13} className="text-semantic-danger shrink-0" />;
  return (
    <span className="relative h-3 w-3 shrink-0 flex items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-text-primary animate-pulseDot" />
      <span className="absolute inset-1 rounded-full bg-bg-tertiary" />
    </span>
  );
}
