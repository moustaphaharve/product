import { Button } from "@product/ui";
import { useSettingsStore } from "../../store/settings";
import { Field, Section, Toggle } from "./shared";

export function PrivacySection() {
  const s = useSettingsStore();
  return (
    <div>
      <Section heading="Telemetry">
        <Field
          label="Share anonymous usage analytics"
          hint="Helps us understand what's being built. No prompts, no project contents."
        >
          <Toggle
            checked={s.telemetryOptIn}
            onChange={(v) => s.update({ telemetryOptIn: v })}
          />
        </Field>
        <Field
          label="Privacy mode"
          hint="Disables cloud-side persistence. Everything stays on this device."
        >
          <Toggle
            checked={s.privacyMode}
            onChange={(v) => s.update({ privacyMode: v })}
          />
        </Field>
      </Section>
      <Section heading="Your data">
        <Field label="Export all data" hint="A zip of every project, message, and setting.">
          <Button variant="secondary" size="sm">
            Export…
          </Button>
        </Field>
        <Field label="Delete all data on this device">
          <Button variant="danger" size="sm">
            Wipe local data
          </Button>
        </Field>
      </Section>
    </div>
  );
}
