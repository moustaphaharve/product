import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import { loadTextureSet, type TextureSetKey } from "./textures";

/**
 * A physically-based floor.
 *
 * Tries to load a 2K PBR set from Poly Haven (diffuse + normal + rough).
 * If the CDN fails or textures are still loading, falls back to a
 * reflective flat-color surface so the viewport never looks half-baked.
 */
export function PBRFloor({
  textureKey,
  reflective,
  fallbackColor,
  anisotropy = 8,
}: {
  textureKey: TextureSetKey;
  reflective: boolean;
  fallbackColor: string;
  anisotropy?: number;
}) {
  const [maps, setMaps] = useState<{
    diffuse: THREE.Texture | null;
    normal: THREE.Texture | null;
    rough: THREE.Texture | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loadTextureSet(loader, textureKey, anisotropy).then((m) => {
      if (!cancelled) setMaps(m);
    });
    return () => {
      cancelled = true;
    };
  }, [textureKey, anisotropy]);

  const hasMaps = maps?.diffuse && maps?.normal && maps?.rough;

  const plane = useMemo(
    () => <planeGeometry args={[80, 80]} />,
    [],
  );

  if (reflective && !hasMaps) {
    // Reflective floor without PBR textures yet.
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        {plane}
        <MeshReflectorMaterial
          mirror={0.55}
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={1.3}
          roughness={0.75}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color={fallbackColor}
          metalness={0.5}
        />
      </mesh>
    );
  }

  if (!hasMaps) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        {plane}
        <meshStandardMaterial color={fallbackColor} roughness={1} metalness={0} />
      </mesh>
    );
  }

  // Full PBR.
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      {plane}
      {reflective ? (
        <MeshReflectorMaterial
          mirror={0.35}
          blur={[250, 100]}
          resolution={1024}
          mixBlur={1.4}
          mixStrength={0.9}
          roughnessMap={maps.rough!}
          normalMap={maps.normal!}
          map={maps.diffuse!}
          depthScale={0.8}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#ffffff"
          metalness={0.15}
        />
      ) : (
        <meshStandardMaterial
          map={maps.diffuse!}
          normalMap={maps.normal!}
          roughnessMap={maps.rough!}
          metalness={0.0}
          roughness={1}
        />
      )}
    </mesh>
  );
}
