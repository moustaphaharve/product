import * as React from "react";
import { cn } from "@product/ui";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b border-border-primary/40 last:border-0">
      <div className="max-w-[360px]">
        <div className="text-sm text-text-primary">{label}</div>
        {hint && (
          <div className="text-xs text-text-tertiary mt-0.5">{hint}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Section({
  heading,
  description,
  children,
}: {
  heading: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-3 mb-2">
        <h2 className="text-sm uppercase tracking-wider text-text-tertiary font-medium">
          {heading}
        </h2>
      </div>
      {description && (
        <p className="text-xs text-text-tertiary mb-3">{description}</p>
      )}
      <div className="rounded-lg border border-border-primary/50 bg-bg-secondary px-4">
        {children}
      </div>
    </section>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-7 px-2 rounded-md bg-bg-input border border-border-primary/60 text-sm text-text-primary focus:border-border-focus outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-8 h-[18px] rounded-full transition-colors duration-micro border",
        checked
          ? "bg-text-primary border-text-primary"
          : "bg-bg-tertiary border-border-primary/60",
      )}
    >
      <span
        className={cn(
          "absolute top-[1px] h-[14px] w-[14px] rounded-full transition-all duration-micro",
          checked
            ? "left-[15px] bg-bg-primary"
            : "left-[1px] bg-text-tertiary",
        )}
      />
    </button>
  );
}
