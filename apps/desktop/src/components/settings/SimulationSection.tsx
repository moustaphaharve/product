import { ENVIRONMENT_OPTIONS } from "@product/types";
import { useSettingsStore } from "../../store/settings";
import { Field, Section, Select } from "./shared";

export function SimulationSection() {
  const s = useSettingsStore();
  return (
    <div>
      <Section heading="Physics">
        <Field
          label="Fidelity preset"
          hint="Fast uses 1 substep. Balanced is the recommended default. High uses 4 substeps and 50 solver iterations."
        >
          <Select
            value={s.simulationFidelity}
            onChange={(v) => s.update({ simulationFidelity: v })}
            options={[
              { value: "fast", label: "Fast" },
              { value: "balanced", label: "Balanced (default)" },
              { value: "high", label: "High" },
            ]}
          />
        </Field>
      </Section>
      <Section heading="Viewport">
        <Field label="Default environment">
          <Select
            value={s.defaultEnvironment}
            onChange={(v) => s.update({ defaultEnvironment: v })}
            options={ENVIRONMENT_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
        </Field>
        <Field label="Rendering quality">
          <Select
            value="high"
            onChange={() => undefined}
            options={[
              { value: "low", label: "Low (battery-friendly)" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High (default)" },
            ]}
          />
        </Field>
      </Section>
    </div>
  );
}
