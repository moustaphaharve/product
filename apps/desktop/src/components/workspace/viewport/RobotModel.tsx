import { Suspense, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";

/**
 * Tries to load a glTF model for a given robot category from /public/models.
 * If the file is missing (404) or fails to parse, renders `fallback`.
 *
 * To use real robot models:
 *   1. Drop a .glb into `apps/desktop/public/models/` named after the
 *      category slug (e.g. `mobile_ground.glb`, `manipulator_arm.glb`,
 *      `mobile_aerial.glb`).
 *   2. Refresh. The loader takes over automatically.
 *
 * Free good starting points:
 *   - https://sketchfab.com/ (filter: Downloadable + CC)
 *   - https://poly.pizza/
 *   - https://modelviewer.dev/shared-assets/models/
 */
export function RobotModel({
  category,
  fallback,
  onPointer,
}: {
  category: string;
  fallback: React.ReactNode;
  onPointer?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const [exists, setExists] = useState<boolean | null>(null);
  const url = `/models/${category}.glb`;

  useEffect(() => {
    let cancelled = false;
    fetch(url, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setExists(r.ok);
      })
      .catch(() => {
        if (!cancelled) setExists(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (exists === false || exists === null) {
    return <>{fallback}</>;
  }

  return (
    <Suspense fallback={<>{fallback}</>}>
      <GLTFInstance url={url} onPointer={onPointer} />
    </Suspense>
  );
}

function GLTFInstance({
  url,
  onPointer,
}: {
  url: string;
  onPointer?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} onPointerOver={onPointer} />;
}
