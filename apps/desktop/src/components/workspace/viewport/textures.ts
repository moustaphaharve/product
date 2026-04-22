import * as THREE from "three";

/**
 * Poly Haven CDN texture sets — 2K, CC0 licensed.
 * If the network blocks the CDN, `useLoader` will throw and we fall back
 * to procedural materials in Viewport.tsx.
 */
export const POLYHAVEN = {
  concretePolished: {
    diffuse:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/concrete_floor_worn_001/concrete_floor_worn_001_diff_2k.jpg",
    normal:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/concrete_floor_worn_001/concrete_floor_worn_001_nor_gl_2k.jpg",
    rough:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/concrete_floor_worn_001/concrete_floor_worn_001_rough_2k.jpg",
    repeat: 6,
  },
  woodFloor: {
    diffuse:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/wood_floor_deck/wood_floor_deck_diff_2k.jpg",
    normal:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/wood_floor_deck/wood_floor_deck_nor_gl_2k.jpg",
    rough:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/wood_floor_deck/wood_floor_deck_rough_2k.jpg",
    repeat: 2,
  },
  forestGround: {
    diffuse:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/forest_ground_01/forest_ground_01_diff_2k.jpg",
    normal:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/forest_ground_01/forest_ground_01_nor_gl_2k.jpg",
    rough:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/forest_ground_01/forest_ground_01_rough_2k.jpg",
    repeat: 10,
  },
  paintedMetal: {
    diffuse:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/metal_plate/metal_plate_diff_2k.jpg",
    normal:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/metal_plate/metal_plate_nor_gl_2k.jpg",
    rough:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/metal_plate/metal_plate_rough_2k.jpg",
    repeat: 1,
  },
} as const;

export type TextureSetKey = keyof typeof POLYHAVEN;

/**
 * Load a texture set and apply sensible defaults (sRGB on diffuse, repeat,
 * anisotropy). Returns `null` for any texture whose network load failed
 * so callers can fall back to a flat material.
 */
export async function loadTextureSet(
  loader: THREE.TextureLoader,
  key: TextureSetKey,
  anisotropy: number,
): Promise<{
  diffuse: THREE.Texture | null;
  normal: THREE.Texture | null;
  rough: THREE.Texture | null;
}> {
  const set = POLYHAVEN[key];
  const load = (url: string): Promise<THREE.Texture | null> =>
    new Promise((resolve) => {
      loader.load(
        url,
        (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(set.repeat, set.repeat);
          tex.anisotropy = anisotropy;
          resolve(tex);
        },
        undefined,
        () => resolve(null),
      );
    });

  const [diffuse, normal, rough] = await Promise.all([
    load(set.diffuse),
    load(set.normal),
    load(set.rough),
  ]);
  if (diffuse) diffuse.colorSpace = THREE.SRGBColorSpace;
  return { diffuse, normal, rough };
}
