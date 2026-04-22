import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/app";
import { useProjectsStore } from "../store/projects";
import { snapshotProject, createProject } from "../lib/api";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);
  const toggleDrawer = useAppStore((s) => s.toggleDrawer);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);

  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }
      if (mod && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      if (mod && e.key === "j") {
        e.preventDefault();
        toggleDrawer();
        return;
      }
      if (mod && e.key === ",") {
        e.preventDefault();
        navigate("/settings");
        return;
      }
      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        const p = await createProject({ name: "Untitled build" });
        navigate(`/projects/${p.id}`);
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const active = useProjectsStore.getState().activeProjectId;
        if (active) await snapshotProject(active, "Manual snapshot");
        return;
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        useAppStore.getState().setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    navigate,
    toggleSidebar,
    toggleCommandPalette,
    toggleDrawer,
    setCommandPaletteOpen,
  ]);
}
