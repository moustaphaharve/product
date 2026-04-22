/**
 * Shared shell layout primitives.
 *
 * The concrete React implementations for the sidebar, home view, and
 * settings live in `apps/desktop/src/components/shell` so they can
 * depend on desktop-only globals (Electron bridge, Framer Motion, etc.).
 * This package holds the layout contracts so that other surfaces (e.g.
 * a future web-only embed) can implement them without rewriting semantics.
 */

export const SHELL_REGIONS = [
  "sidebar",
  "home",
  "workspace",
  "settings",
  "command_palette",
  "menu_bar",
] as const;

export type ShellRegion = (typeof SHELL_REGIONS)[number];

export interface ShellContract {
  region: ShellRegion;
  requiresProject?: boolean;
}
