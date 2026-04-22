import { Button } from "@product/ui";
import { useAppStore } from "../../store/app";
import { Field, Section } from "./shared";

export function AccountSection() {
  const setStage = useAppStore((s) => s.setStage);
  return (
    <div>
      <Section heading="Profile">
        <Field label="Display name">
          <input
            defaultValue="You"
            className="h-7 w-56 rounded-md bg-bg-input border border-border-primary/60 px-2 text-sm"
          />
        </Field>
        <Field label="Email">
          <input
            defaultValue="you@example.com"
            className="h-7 w-56 rounded-md bg-bg-input border border-border-primary/60 px-2 text-sm"
          />
        </Field>
        <Field label="Password">
          <Button variant="secondary" size="sm">
            Change password
          </Button>
        </Field>
      </Section>

      <Section heading="Session">
        <Field label="Sign out of this device">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStage("welcome")}
          >
            Sign out
          </Button>
        </Field>
        <Field
          label="Delete account"
          hint="Permanently remove your account and all projects."
        >
          <Button variant="danger" size="sm">
            Delete account…
          </Button>
        </Field>
      </Section>
    </div>
  );
}
