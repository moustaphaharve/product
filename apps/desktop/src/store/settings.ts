import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EnvironmentType,
  UserSettings,
} from "@product/types";

type Theme = "dark" | "light" | "system";
type AIPref = "auto" | "prefer_speed" | "prefer_quality";
type SimFidelity = "fast" | "balanced" | "high";

interface SettingsState {
  theme: Theme;
  language: string;
  aiPreference: AIPref;
  simulationFidelity: SimFidelity;
  defaultEnvironment: EnvironmentType;
  preferredSuppliers: string[];
  region: string;
  telemetryOptIn: boolean;
  privacyMode: boolean;
  customShortcuts: Record<string, string>;
  experimentalFeatures: string[];
  hydrateFromServer: (patch: Partial<UserSettings>) => void;
  update: (patch: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      language: "en",
      aiPreference: "auto",
      simulationFidelity: "balanced",
      defaultEnvironment: "empty",
      preferredSuppliers: [],
      region: "US",
      telemetryOptIn: true,
      privacyMode: false,
      customShortcuts: {},
      experimentalFeatures: [],
      hydrateFromServer: (patch) =>
        set((s) => ({
          ...s,
          ...patch,
          theme: (patch.theme as Theme | undefined) ?? s.theme,
          aiPreference:
            (patch.aiPreference as AIPref | undefined) ?? s.aiPreference,
          simulationFidelity:
            (patch.simulationFidelity as SimFidelity | undefined) ??
            s.simulationFidelity,
          defaultEnvironment:
            patch.defaultEnvironment ?? s.defaultEnvironment,
        })),
      update: (patch) => set((s) => ({ ...s, ...patch })),
    }),
    { name: "product.settings" },
  ),
);
