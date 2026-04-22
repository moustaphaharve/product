import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppStage = "welcome" | "onboarding" | "ready";

interface AppState {
  stage: AppStage;
  sidebarCollapsed: boolean;
  drawerOpen: boolean;
  drawerTab: "components" | "firmware" | "wiring" | "build";
  commandPaletteOpen: boolean;
  onboarding: {
    useCase: string[];
    experience: "beginner" | "some" | "advanced" | null;
  };
  setStage: (stage: AppStage) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerTab: (tab: AppState["drawerTab"]) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setOnboarding: (patch: Partial<AppState["onboarding"]>) => void;
  finishOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      stage: "welcome",
      sidebarCollapsed: false,
      drawerOpen: false,
      drawerTab: "components",
      commandPaletteOpen: false,
      onboarding: { useCase: [], experience: null },
      setStage: (stage) => set({ stage }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      setDrawerTab: (drawerTab) => set({ drawerTab, drawerOpen: true }),
      toggleCommandPalette: () =>
        set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
      setCommandPaletteOpen: (commandPaletteOpen) =>
        set({ commandPaletteOpen }),
      setOnboarding: (patch) =>
        set((s) => ({ onboarding: { ...s.onboarding, ...patch } })),
      finishOnboarding: () => set({ stage: "ready" }),
    }),
    {
      name: "product.app",
      partialize: (s) => ({
        stage: s.stage,
        sidebarCollapsed: s.sidebarCollapsed,
        onboarding: s.onboarding,
      }),
    },
  ),
);
