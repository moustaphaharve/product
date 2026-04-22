import { useSettingsStore } from "../../store/settings";
import { Field, Section, Select } from "./shared";

const SUPPLIERS = [
  "Adafruit",
  "SparkFun",
  "Pololu",
  "Amazon",
  "DigiKey",
  "Mouser",
  "Robotis",
  "T-Motor",
  "HobbyKing",
];

export function ComponentsSection() {
  const s = useSettingsStore();

  const toggleSupplier = (name: string) => {
    s.update({
      preferredSuppliers: s.preferredSuppliers.includes(name)
        ? s.preferredSuppliers.filter((n) => n !== name)
        : [...s.preferredSuppliers, name],
    });
  };

  return (
    <div>
      <Section heading="Region & currency">
        <Field
          label="Shipping region"
          hint="Affects default currency and which suppliers are ranked first."
        >
          <Select
            value={s.region}
            onChange={(v) => s.update({ region: v })}
            options={[
              { value: "US", label: "United States" },
              { value: "EU", label: "Europe" },
              { value: "UK", label: "United Kingdom" },
              { value: "JP", label: "Japan" },
              { value: "CA", label: "Canada" },
            ]}
          />
        </Field>
      </Section>
      <Section
        heading="Preferred suppliers"
        description="Click to toggle. We'll rank these first when sourcing components."
      >
        <div className="py-3 flex flex-wrap gap-2">
          {SUPPLIERS.map((n) => {
            const active = s.preferredSuppliers.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggleSupplier(n)}
                className={`px-2.5 h-7 rounded-md border text-xs transition-colors duration-micro ${
                  active
                    ? "bg-accent-subtle border-border-secondary text-text-primary"
                    : "bg-bg-input border-border-primary/60 text-text-secondary hover:text-text-primary"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </Section>
      <Section heading="Custom library">
        <Field
          label="Private component library"
          hint="Import your own parts database. Coming in V2."
        >
          <span className="text-xs text-text-tertiary">Coming soon</span>
        </Field>
      </Section>
    </div>
  );
}
