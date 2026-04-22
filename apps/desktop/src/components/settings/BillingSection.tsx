import { Button } from "@product/ui";
import { Field, Section } from "./shared";

export function BillingSection() {
  const used = 14;
  const total = 30;
  const pct = Math.min(100, (used / total) * 100);

  return (
    <div>
      <Section heading="Current plan">
        <Field
          label="Free plan"
          hint="30 credits per month. Upgrade for unlimited generations and higher-quality models."
        >
          <Button variant="primary" size="sm">
            Upgrade to Pro
          </Button>
        </Field>
        <Field label="Credit usage this month">
          <div className="w-56 flex flex-col gap-1.5 items-end">
            <div className="w-full h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
              <div
                className="h-full bg-text-primary transition-[width] duration-state"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-[11px] text-text-tertiary font-mono">
              {used} / {total} credits used
            </div>
          </div>
        </Field>
      </Section>

      <Section heading="Payment">
        <Field label="Payment method" hint="We'll only charge for overages.">
          <Button variant="secondary" size="sm">
            Add payment method
          </Button>
        </Field>
      </Section>

      <Section heading="Invoices">
        <div className="py-6 text-center text-sm text-text-tertiary">
          No invoices yet.
        </div>
      </Section>
    </div>
  );
}
