import { Section } from "./shared";

const SHORTCUTS: Array<{ label: string; keys: string }> = [
  { label: "Command palette", keys: "? K" },
  { label: "New project", keys: "? N" },
  { label: "Open settings", keys: "? ," },
  { label: "Toggle sidebar", keys: "? B" },
  { label: "Toggle drawer", keys: "? J" },
  { label: "Submit chat", keys: "? ?" },
  { label: "Pause / play simulation", keys: "Space" },
  { label: "Close drawer / modal", keys: "Esc" },
  { label: "Save manual version snapshot", keys: "? S" },
  { label: "Keyboard shortcuts help", keys: "? /" },
];

export function ShortcutsSection() {
  return (
    <Section
      heading="Shortcuts"
      description="Click any row to customize (customization coming soon)."
    >
      <div className="py-2 divide-y divide-border-primary/40">
        {SHORTCUTS.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-2.5">
            <div className="text-sm text-text-primary">{s.label}</div>
            <kbd className="font-mono text-xs text-text-secondary bg-bg-input border border-border-primary/60 rounded px-1.5 py-0.5">
              {s.keys}
            </kbd>
          </div>
        ))}
      </div>
    </Section>
  );
}
