import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Loads a glTF robot for a given category from /public/models.
 *
 * Behaviors:
 * - HEADs the URL first and short-circuits when missing (keeps console clean).
 * - Auto-normalizes: centers the model horizontally, places its base at y=0,
 *   and rescales to fit roughly 1 m of height so any dropped-in model works.
 * - Plays the first animation clip if one is embedded (RobotExpressive has
 *   a "Dance"/"Idle"/"Walking" set — we pick "Idle" when available).
 * - Falls back to the primitive `fallback` while loading or on failure.
 *
 * To override: drop `apps/desktop/public/models/{category}.glb` and refresh.
 */
const TARGET_HEIGHT = 1.0;

export function RobotModel({
  category,
  fallback,
}: {
  category: string;
  fallback: React.ReactNode;
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
      <GLTFInstance url={url} />
    </Suspense>
  );
}

function GLTFInstance({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const group = useRef<THREE.Group>(null);

  const { clonedScene, mixer, clip } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    // Auto-normalize: center XZ, snap base to y=0, uniform scale to 1 m tall.
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    cloned.scale.setScalar(scale);

    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    cloned.position.x -= center.x;
    cloned.position.z -= center.z;
    cloned.position.y -= box2.min.y;

    // Animation: prefer Idle, then first available clip.
    const clips = gltf.animations ?? [];
    const preferred =
      clips.find((c) => /idle/i.test(c.name)) ??
      clips.find((c) => /walk/i.test(c.name)) ??
      clips[0];
    const mixer = preferred ? new THREE.AnimationMixer(cloned) : null;
    const clip = preferred ? mixer!.clipAction(preferred) : null;
    if (clip) clip.play();

    return { clonedScene: cloned, mixer, clip };
  }, [gltf]);

  useFrame((_, delta) => {
    mixer?.update(delta);
  });

  // Cleanup on unmount / model swap
  useEffect(() => {
    return () => {
      mixer?.stopAllAction();
      mixer?.uncacheRoot(clonedScene);
      void clip;
    };
  }, [mixer, clonedScene, clip]);

  return (
    <group ref={group}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/humanoid.glb");
