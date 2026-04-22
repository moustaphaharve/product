import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ENVIRONMENT_OPTIONS, type EnvironmentType } from "@product/types";
import { useProjectsStore } from "../../store/projects";

export function EnvironmentPicker({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const project = useProjectsStore((s) => s.projects[projectId]);
  const setEnvironment = useProjectsStore((s) => s.setEnvironment);
  const current = project?.environment ?? "empty";

  const currentMeta =
    ENVIRONMENT_OPTIONS.find((o) => o.value === current) ??
    ENVIRONMENT_OPTIONS[0]!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-2.5 h-7 rounded-md bg-bg-secondary/70 backdrop-blur border border-border-primary/50 text-xs text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 transition-colors duration-micro"
      >
        {currentMeta.label}
        <ChevronDown size={11} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-9 left-0 min-w-[220px] bg-bg-tertiary border border-border-primary/60 rounded-lg shadow-xl p-1 z-30"
          >
            {ENVIRONMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setEnvironment(projectId, opt.value as EnvironmentType);
                  setOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent-subtle flex items-center gap-2 transition-colors duration-micro"
              >
                <div className="w-3 flex justify-center">
                  {opt.value === current && (
                    <Check size={11} className="text-text-primary" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-text-primary">{opt.label}</div>
                  <div className="text-[11px] text-text-tertiary">
                    {opt.description}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
