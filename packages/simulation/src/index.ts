export * from "./templates";

/**
 * MuJoCo WebAssembly integration is loaded inside the desktop app's
 * physics worker. If the WASM fails to initialize, the viewport falls
 * back to pre-recorded per-category animations (see apps/desktop
 * viewport fallback logic).
 */
export const PHYSICS_FIDELITY = {
  fast: { substeps: 1, solverIterations: 10 },
  balanced: { substeps: 2, solverIterations: 20 },
  high: { substeps: 4, solverIterations: 50 },
} as const;

export type PhysicsFidelity = keyof typeof PHYSICS_FIDELITY;
