import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  CreditCard,
  Sparkles,
  Cpu,
  Layers,
  KeyRound,
  ShieldCheck,
  FlaskConical,
  Info,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { cn } from "@product/ui";
import { GeneralSection } from "../components/settings/GeneralSection";
import { AccountSection } from "../components/settings/AccountSection";
import { BillingSection } from "../components/settings/BillingSection";
import { AISection } from "../components/settings/AISection";
import { SimulationSection } from "../components/settings/SimulationSection";
import { ComponentsSection } from "../components/settings/ComponentsSection";
import { ShortcutsSection } from "../components/settings/ShortcutsSection";
import { PrivacySection } from "../components/settings/PrivacySection";
import { AdvancedSection } from "../components/settings/AdvancedSection";
import { AboutSection } from "../components/settings/AboutSection";

const NAV = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "account", label: "Account", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "ai", label: "AI & Models", icon: Sparkles },
  { id: "simulation", label: "Simulation", icon: Layers },
  { id: "components", label: "Components", icon: Cpu },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: KeyRound },
  { id: "privacy", label: "Data & Privacy", icon: ShieldCheck },
  { id: "advanced", label: "Advanced", icon: FlaskConical },
  { id: "about", label: "About", icon: Info },
] as const;

type SectionId = (typeof NAV)[number]["id"];

export function SettingsView() {
  const location = useLocation();
  const nav = useNavigate();
  const active = (location.pathname.split("/")[2] ?? "general") as SectionId;

  return (
    <div className="absolute inset-0 bg-bg-primary flex">
      <aside className="w-[240px] shrink-0 border-r border-border-primary/50 bg-bg-secondary flex flex-col">
        <div className="h-11 flex items-center justify-between px-3 border-b border-border-primary/50">
          <div className="text-sm text-text-secondary">Settings</div>
          <button
            onClick={() => nav("/")}
            className="h-7 w-7 rounded-md inline-flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
            aria-label="Close settings"
          >
            <X size={14} />
          </button>
        </div>
        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.id;
            return (
              <Link
                key={n.id}
                to={`/settings/${n.id}`}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors duration-micro",
                  isActive
                    ? "bg-accent-subtle text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-accent-subtle",
                )}
              >
                <Icon size={13} className="text-text-tertiary" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[780px] mx-auto px-10 py-10">
          <SectionTitle id={active} />
          <div className="mt-6">
            {active === "general" && <GeneralSection />}
            {active === "account" && <AccountSection />}
            {active === "billing" && <BillingSection />}
            {active === "ai" && <AISection />}
            {active === "simulation" && <SimulationSection />}
            {active === "components" && <ComponentsSection />}
            {active === "shortcuts" && <ShortcutsSection />}
            {active === "privacy" && <PrivacySection />}
            {active === "advanced" && <AdvancedSection />}
            {active === "about" && <AboutSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ id }: { id: SectionId }) {
  const meta = NAV.find((n) => n.id === id);
  if (!meta) return null;
  return (
    <div>
      <h1 className="text-xl font-normal tracking-[-0.01em]">{meta.label}</h1>
    </div>
  );
}
