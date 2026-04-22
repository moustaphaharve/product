import { useSettingsStore } from "../../store/settings";
import { Field, Section, Select } from "./shared";

export function AISection() {
  const s = useSettingsStore();
  return (
    <div>
      <Section heading="Routing">
        <Field
          label="Model preference"
          hint="Auto picks the best model per task. Prefer speed biases to Haiku; prefer quality biases to Opus."
        >
          <Select
            value={s.aiPreference}
            onChange={(v) => s.update({ aiPreference: v })}
            options={[
              { value: "auto", label: "Auto (recommended)" },
              { value: "prefer_speed", label: "Prefer speed" },
              { value: "prefer_quality", label: "Prefer quality" },
            ]}
          />
        </Field>
      </Section>

      <Section heading="Advanced">
        <Field
          label="System prompt additions"
          hint="Appended to every AI call. Use this to enforce your team's engineering style."
        >
          <textarea
            rows={3}
            placeholder="e.g. Prefer ROS 2, default to Python, avoid proprietary parts…"
            className="w-[320px] rounded-md bg-bg-input border border-border-primary/60 px-2 py-1.5 text-xs font-mono"
          />
        </Field>
        <Field
          label="Bring your own Anthropic key"
          hint="Overrides Product's routing and billing."
        >
          <input
            type="password"
            placeholder="sk-ant-…"
            className="h-7 w-56 rounded-md bg-bg-input border border-border-primary/60 px-2 text-sm font-mono"
          />
        </Field>
      </Section>
    </div>
  );
}
