import { useSettingsStore } from "../../store/settings";
import { Field, Section, Select, Toggle } from "./shared";

export function GeneralSection() {
  const s = useSettingsStore();
  return (
    <div>
      <Section heading="Appearance">
        <Field label="Theme" hint="Match the rest of your desktop, or lock to dark / light.">
          <Select
            value={s.theme}
            onChange={(v) => s.update({ theme: v })}
            options={[
              { value: "dark", label: "Dark (default)" },
              { value: "light", label: "Light" },
              { value: "system", label: "System" },
            ]}
          />
        </Field>
        <Field label="Language">
          <Select
            value={s.language}
            onChange={(v) => s.update({ language: v })}
            options={[
              { value: "en", label: "English" },
              { value: "de", label: "Deutsch" },
              { value: "fr", label: "Français" },
              { value: "ja", label: "???" },
            ]}
          />
        </Field>
      </Section>

      <Section heading="Startup">
        <Field
          label="Open last project on launch"
          hint="Otherwise, land on the Home view."
        >
          <Toggle
            checked={s.experimentalFeatures.includes("reopenLast")}
            onChange={(on) =>
              s.update({
                experimentalFeatures: on
                  ? [...s.experimentalFeatures, "reopenLast"]
                  : s.experimentalFeatures.filter((x) => x !== "reopenLast"),
              })
            }
          />
        </Field>
        <Field
          label="Default project location"
          hint="Where exported build packages land."
        >
          <code className="text-xs text-text-tertiary font-mono bg-bg-input px-2 py-1 rounded">
            ~/Documents/Product
          </code>
        </Field>
      </Section>
    </div>
  );
}
