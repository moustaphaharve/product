import { getGPUTier } from "detect-gpu";

/**
 * Three render-quality tiers:
 *
 * - `cinema`  — everything on: N8AO, Bloom, SMAA, high DPR, 2K shadows,
 *               real PBR floor, clearcoat materials. Needs a real GPU.
 * - `balanced`— default: Bloom + SMAA, medium shadows, texture floor.
 * - `lite`    — integrated-graphics / battery mode: no SSAO, lighter bloom,
 *               flat materials, lower shadow res.
 *
 * Auto-selected via `detect-gpu` on first mount; user can override from
 * Settings ? Simulation ? Rendering quality.
 */
export type RenderQuality = "lite" | "balanced" | "cinema";

const CINEMA_MIN_SCORE = 20;
const BALANCED_MIN_SCORE = 10;

export async function detectQuality(): Promise<RenderQuality> {
  try {
    const tier = await getGPUTier();
    const score =
      (tier.fps ?? 0) +
      (tier.tier ?? 0) * 10 +
      (tier.isMobile ? -10 : 0);
    if (score >= CINEMA_MIN_SCORE) return "cinema";
    if (score >= BALANCED_MIN_SCORE) return "balanced";
    return "lite";
  } catch {
    return "balanced";
  }
}

export interface QualitySettings {
  dpr: [number, number];
  shadowMapSize: number;
  contactShadowsResolution: number;
  contactShadowsBlur: number;
  enableSSAO: boolean;
  ssaoIntensity: number;
  enableBloom: boolean;
  bloomIntensity: number;
  enableChromaticAberration: boolean;
  chromaticOffset: number;
  enablePBRFloor: boolean;
  enableAreaLights: boolean;
  sparklesCount: number;
}

export const QUALITY: Record<RenderQuality, QualitySettings> = {
  lite: {
    dpr: [1, 1.25],
    shadowMapSize: 1024,
    contactShadowsResolution: 512,
    contactShadowsBlur: 2.4,
    enableSSAO: false,
    ssaoIntensity: 0,
    enableBloom: true,
    bloomIntensity: 0.35,
    enableChromaticAberration: false,
    chromaticOffset: 0,
    enablePBRFloor: false,
    enableAreaLights: false,
    sparklesCount: 40,
  },
  balanced: {
    dpr: [1, 1.75],
    shadowMapSize: 2048,
    contactShadowsResolution: 1024,
    contactShadowsBlur: 2.6,
    enableSSAO: true,
    ssaoIntensity: 1.2,
    enableBloom: true,
    bloomIntensity: 0.6,
    enableChromaticAberration: true,
    chromaticOffset: 0.00035,
    enablePBRFloor: true,
    enableAreaLights: true,
    sparklesCount: 70,
  },
  cinema: {
    dpr: [1, 2],
    shadowMapSize: 2048,
    contactShadowsResolution: 1536,
    contactShadowsBlur: 2.8,
    enableSSAO: true,
    ssaoIntensity: 1.6,
    enableBloom: true,
    bloomIntensity: 0.85,
    enableChromaticAberration: true,
    chromaticOffset: 0.0005,
    enablePBRFloor: true,
    enableAreaLights: true,
    sparklesCount: 110,
  },
};
