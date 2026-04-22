import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./components/shell/Sidebar";
import { HomeView } from "./views/HomeView";
import { WorkspaceView } from "./views/WorkspaceView";
import { SettingsView } from "./views/SettingsView";
import { CommandPalette } from "./components/shell/CommandPalette";
import { WelcomeView } from "./views/WelcomeView";
import { OnboardingView } from "./views/OnboardingView";
import { useAppStore } from "./store/app";
import { useSettingsStore } from "./store/settings";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useMenuBridge } from "./hooks/useMenuBridge";
import { ErrorBoundary } from "./components/shell/ErrorBoundary";

export function App() {
  useMenuBridge();
  useKeyboardShortcuts();
  const theme = useSettingsStore((s) => s.theme);
  const appState = useAppStore((s) => s.stage);

  useEffect(() => {
    const root = document.documentElement;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const effective = theme === "system" ? system : theme;
    root.classList.toggle("theme-light", effective === "light");
  }, [theme]);

  if (appState === "welcome") return <WelcomeView />;
  if (appState === "onboarding") return <OnboardingView />;

  return (
    <ErrorBoundary>
      <ShellLayout />
    </ErrorBoundary>
  );
}

function ShellLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <main className="flex-1 relative min-w-0">
        <AnimatedRoutes />
      </main>
      <CommandPalette />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <ViewFade routeKey="home">
              <HomeView />
            </ViewFade>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ViewFade routeKey="workspace">
              <WorkspaceView />
            </ViewFade>
          }
        />
        <Route
          path="/settings/*"
          element={
            <ViewFade routeKey="settings">
              <SettingsView />
            </ViewFade>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function ViewFade({
  routeKey,
  children,
}: {
  routeKey: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={routeKey}
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 0.995 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.995 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
