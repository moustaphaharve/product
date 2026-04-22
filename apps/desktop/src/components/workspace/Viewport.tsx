import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { Group, MathUtils } from "three";
import { Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@product/ui";
import { useProjectsStore } from "../../store/projects";
import { useAppStore } from "../../store/app";
import type { EnvironmentType } from "@product/types";
import { EnvironmentPicker } from "./EnvironmentPicker";

const ENV_BACKDROPS: Record<
  EnvironmentType,
  { ground: string; fog: [number, number, number] }
> = {
  empty: { ground: "#0d0d0e", fog: [0.04, 0.04, 0.05] },
  warehouse: { ground: "#1a1a1c", fog: [0.08, 0.08, 0.09] },
  outdoor_path: { ground: "#1a2414", fog: [0.07, 0.1, 0.07] },
  tabletop: { ground: "#231a12", fog: [0.12, 0.09, 0.06] },
  flight_space: { ground: "#08080c", fog: [0.03, 0.03, 0.05] },
};

export function Viewport({ projectId }: { projectId: string }) {
  const project = useProjectsStore((s) => s.projects[projectId]);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerTab = useAppStore((s) => s.setDrawerTab);
  const [playing, setPlaying] = useState(true);
  const [fps, setFps] = useState(60);

  const env: EnvironmentType =
    project?.environment ?? project?.robotSpec?.environment ?? "empty";
  const backdrop = ENV_BACKDROPS[env];

  return (
    <div className="absolute inset-0 bg-viewport-bg">
      <Canvas
        shadows
        camera={{ position: [5, 4, 5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={[backdrop.ground, 10, 45]} />
        <color attach="background" args={[backdrop.ground]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.25} />
          <directionalLight
            position={[5, 8, 4]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <Grid
            args={[80, 80]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#222"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#333"
            fadeDistance={35}
            fadeStrength={1}
            infiniteGrid
          />
          <EnvironmentScene env={env} />
          <RobotPlaceholder
            category={project?.robotSpec?.category ?? "mobile_ground"}
            playing={playing}
            onFps={setFps}
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={1.5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>

      {/* Top chrome */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <EnvironmentPicker projectId={projectId} />
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-secondary/70 backdrop-blur border border-border-primary/50 text-xs font-mono text-text-tertiary">
            {fps.toFixed(0)} FPS
          </div>
          <div className="flex items-center gap-1 px-1 py-1 rounded-md bg-bg-secondary/70 backdrop-blur border border-border-primary/50">
            <ChromeButton
              tooltip={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
            </ChromeButton>
            <ChromeButton tooltip="Reset">
              <RotateCcw size={13} />
            </ChromeButton>
            <ChromeButton tooltip="Maximize">
              <Maximize2 size={13} />
            </ChromeButton>
          </div>
        </div>
      </div>

      {/* Drawer triggers */}
      <div
        className={cn(
          "absolute left-3 right-3 bottom-3 flex items-center gap-1.5 justify-start pointer-events-none transition-opacity duration-panel",
          drawerOpen ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="pointer-events-auto flex items-center gap-1.5 px-1 py-1 rounded-md bg-bg-secondary/70 backdrop-blur border border-border-primary/50">
          <DrawerTrigger
            label="Components"
            onClick={() => setDrawerTab("components")}
          />
          <DrawerTrigger
            label="Firmware"
            onClick={() => setDrawerTab("firmware")}
          />
          <DrawerTrigger
            label="Wiring"
            onClick={() => setDrawerTab("wiring")}
          />
          <DrawerTrigger label="Build" onClick={() => setDrawerTab("build")} />
        </div>
      </div>
    </div>
  );
}

function ChromeButton({
  tooltip,
  onClick,
  children,
}: {
  tooltip: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={tooltip}
      onClick={onClick}
      className="h-7 w-7 rounded inline-flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
    >
      {children}
    </button>
  );
}

function DrawerTrigger({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 h-7 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
    >
      {label}
    </button>
  );
}

function EnvironmentScene({ env }: { env: EnvironmentType }) {
  if (env === "warehouse") {
    return (
      <group>
        <mesh position={[4, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 2, 6]} />
          <meshStandardMaterial color="#3a3a3e" roughness={0.7} metalness={0.2} />
        </mesh>
        <mesh position={[-4, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 2, 6]} />
          <meshStandardMaterial color="#3a3a3e" roughness={0.7} metalness={0.2} />
        </mesh>
        <mesh position={[1.5, 0.1, 2]} receiveShadow castShadow>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color="#6d4e2a" roughness={0.9} />
        </mesh>
        <mesh position={[-1.8, 0.1, -2]} receiveShadow castShadow>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color="#6d4e2a" roughness={0.9} />
        </mesh>
      </group>
    );
  }
  if (env === "outdoor_path") {
    return (
      <group>
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[2, 0.02, 20]} />
          <meshStandardMaterial color="#4d3a22" roughness={1} />
        </mesh>
        <mesh position={[3, 0.3, 2]} castShadow>
          <sphereGeometry args={[0.3, 12, 8]} />
          <meshStandardMaterial color="#5e5e62" roughness={0.9} />
        </mesh>
        <mesh position={[-2, 0.2, -3]} castShadow>
          <sphereGeometry args={[0.22, 12, 8]} />
          <meshStandardMaterial color="#646468" roughness={0.9} />
        </mesh>
      </group>
    );
  }
  if (env === "tabletop") {
    return (
      <group>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.05, 1]} />
          <meshStandardMaterial color="#8a6238" roughness={0.7} />
        </mesh>
        <mesh position={[0.3, 0.82, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#e44d3c" />
        </mesh>
        <mesh position={[-0.3, 0.82, -0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 20]} />
          <meshStandardMaterial color="#3d7fe0" />
        </mesh>
      </group>
    );
  }
  if (env === "flight_space") {
    return (
      <group>
        {[
          { p: [0, 0.5, 10] as [number, number, number], c: "#e05151" },
          { p: [10, 0.5, 0] as [number, number, number], c: "#55d071" },
          { p: [0, 0.5, -10] as [number, number, number], c: "#4a88e0" },
          { p: [-10, 0.5, 0] as [number, number, number], c: "#ddb03a" },
        ].map((m, i) => (
          <mesh key={i} position={m.p} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
            <meshStandardMaterial color={m.c} emissive={m.c} emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
    );
  }
  return null;
}

/**
 * Pre-recorded per-category animation fallback. Used whenever the MuJoCo
 * WASM integration is not yet loaded (V1 default). The real robot mesh
 * is driven by the physics worker once it comes online.
 */
function RobotPlaceholder({
  category,
  playing,
  onFps,
}: {
  category: string;
  playing: boolean;
  onFps: (fps: number) => void;
}) {
  const ref = useRef<Group>(null);
  const tRef = useRef(0);
  const lastTs = useRef(performance.now());
  const frames = useRef(0);

  useFrame((_, delta) => {
    frames.current += 1;
    const now = performance.now();
    if (now - lastTs.current > 500) {
      onFps((frames.current * 1000) / (now - lastTs.current));
      frames.current = 0;
      lastTs.current = now;
    }
    if (!playing || !ref.current) return;
    tRef.current += delta;
    const t = tRef.current;

    if (category === "mobile_aerial") {
      ref.current.position.y = 1.2 + Math.sin(t * 2) * 0.12;
      ref.current.rotation.y = t * 0.6;
    } else if (category === "manipulator_arm") {
      ref.current.rotation.y = Math.sin(t * 0.7) * 0.5;
    } else if (category === "humanoid" || category === "quadruped") {
      ref.current.position.y = MathUtils.lerp(
        ref.current.position.y,
        0.1 + Math.sin(t * 2) * 0.02,
        0.2,
      );
    } else {
      ref.current.position.x = Math.sin(t * 0.6) * 1.5;
      ref.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group ref={ref} position={[0, 0.2, 0]}>
      {category === "mobile_aerial" ? <DroneMesh /> : <WheeledMesh />}
    </group>
  );
}

function WheeledMesh() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.8]} />
        <meshStandardMaterial color="#d7d7d7" metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, 0.33, 0.1]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#141414" metalness={0.6} roughness={0.2} />
      </mesh>
      {[
        [-0.32, 0.12, -0.3],
        [0.32, 0.12, -0.3],
        [-0.32, 0.12, 0.3],
        [0.32, 0.12, 0.3],
      ].map((p, i) => (
        <mesh
          key={i}
          castShadow
          position={p as [number, number, number]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.12, 0.12, 0.08, 20]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function DroneMesh() {
  const rotors = [
    [0.35, 0.15, 0.35],
    [-0.35, 0.15, 0.35],
    [0.35, 0.15, -0.35],
    [-0.35, 0.15, -0.35],
  ];
  return (
    <group position={[0, 0.6, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#cfcfcf" metalness={0.4} roughness={0.3} />
      </mesh>
      {rotors.map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 10]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <SpinningRotor />
        </group>
      ))}
    </group>
  );
}

function SpinningRotor() {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 22;
  });
  return (
    <group ref={ref} position={[0, 0.09, 0]}>
      <mesh>
        <boxGeometry args={[0.35, 0.005, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}
