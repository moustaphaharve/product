import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  SMAA,
  Vignette,
  N8AO,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Vector2 } from "three";
import type { QualitySettings } from "./quality";

/**
 * Cinematic post-processing stack.
 *
 * Order matters ù SSAO before bloom so dark creases don't get blown out.
 * Bloom threshold is high so only emissive materials (LEDs, lamps, neon markers)
 * bleed, not the whole scene. SMAA gives clean edges on thin geometry
 * (lidar stalks, wheel spokes, wiring).
 */
export function PostFX({ q }: { q: QualitySettings }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={q.enableSSAO}>
      {q.enableSSAO ? (
        <N8AO
          aoRadius={0.45}
          intensity={q.ssaoIntensity}
          distanceFalloff={0.4}
          quality="medium"
          halfRes
          color="black"
        />
      ) : (
        <></>
      )}
      {q.enableBloom ? (
        <Bloom
          mipmapBlur
          intensity={q.bloomIntensity}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.22}
          kernelSize={KernelSize.LARGE}
        />
      ) : (
        <></>
      )}
      {q.enableChromaticAberration ? (
        <ChromaticAberration
          offset={new Vector2(q.chromaticOffset, q.chromaticOffset)}
          radialModulation={false}
          modulationOffset={0}
        />
      ) : (
        <></>
      )}
      <Vignette
        eskil={false}
        offset={0.15}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
      <SMAA />
    </EffectComposer>
  );
}
