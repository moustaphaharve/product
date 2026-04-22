import { useSettingsStore } from "../../store/settings";
import { Field, Section, Select, Toggle } from "./shared";

const FLAGS = [
  {
    id: "live_physics",
    label: "Live MuJoCo physics worker",
    hint: "When off, the viewport uses pre-recorded category animations.",
  },
  {
    id: "opus_firmware",
    label: "Use Opus for firmware generation",
    hint: "Higher quality, slower, more credits.",
  },
  {
    id: "reopenLast",
    label: "Reopen last project on launch",
    hint: "Mirrors the General setting; toggled here for scripting.",
  },
];

export function AdvancedSection() {
  const s = useSettingsStore();

  const toggleFlag = (id: string) => {
    s.update({
      experimentalFeatures: s.experimentalFeatures.includes(id)
        ? s.experimentalFeatures.filter((x) => x !== id)
        : [...s.experimentalFeatures, id],
    });
  };

  return (
    <div>
      <Section heading="Experimental features">
        {FLAGS.map((f) => (
          <Field key={f.id} label={f.label} hint={f.hint}>
            <Toggle
              checked={s.experimentalFeatures.includes(f.id)}
              onChange={() => toggleFlag(f.id)}
            />
          </Field>
        ))}
      </Section>

      <Section heading="Developer tools">
        <Field
          label="Log level"
          hint="Controls how chatty the desktop app's console is."
        >
          <Select
            value="info"
            onChange={() => undefined}
            options={[
              { value: "error", label: "Error" },
              { value: "warn", label: "Warn" },
              { value: "info", label: "Info" },
              { value: "debug", label: "Debug" },
              { value: "trace", label: "Trace" },
            ]}
          />
        </Field>
      </Section>
    </div>
  );
}
