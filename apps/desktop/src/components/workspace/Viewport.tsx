import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Grid,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import { Group, MathUtils, RectAreaLight } from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { Maximize2, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@product/ui";
import { useProjectsStore } from "../../store/projects";
import { useAppStore } from "../../store/app";
import type { EnvironmentType } from "@product/types";
import { EnvironmentPicker } from "./EnvironmentPicker";
import { PostFX } from "./viewport/PostFX";
import { PBRFloor } from "./viewport/PBRFloor";
import {
  detectQuality,
  QUALITY,
  type RenderQuality,
} from "./viewport/quality";
import type { TextureSetKey } from "./viewport/textures";

RectAreaLightUniformsLib.init();

/**
 * Cinematic viewport.
 *
 * Render stack:
 * - ACESFilmic tone mapping + per-scene exposure
 * - HDRI environment (IBL) per scene
 * - High-res shadow maps + ContactShadows
 * - PBR (2K) floor via Poly Haven CDN; graceful fallback to reflective flat
 * - MeshPhysicalMaterial with clearcoat on robot chassis
 * - RectAreaLight ceiling strips in warehouse/tabletop (balanced+cinema)
 * - EffectComposer: N8AO -> Bloom -> ChromaticAberration -> Vignette -> SMAA
 * - Auto-detected render quality (lite / balanced / cinema) with override
 *
 * Real MuJoCo physics still runs in a worker when enabled; these meshes are
 * the spec-required fallback "per-category pre-recorded animations".
 */

interface EnvBackdrop {
  hdri:
    | "apartment"
    | "city"
    | "dawn"
    | "forest"
    | "lobby"
    | "night"
    | "park"
    | "studio"
    | "sunset"
    | "warehouse";
  exposure: number;
  fog: { color: string; near: number; far: number };
  bg: string;
  accent: string;
  floorTexture: TextureSetKey;
  floorColor: string;
  reflectiveFloor: boolean;
}

const ENV_BACKDROPS: Record<EnvironmentType, EnvBackdrop> = {
  empty: {
    hdri: "studio",
    exposure: 1.0,
    fog: { color: "#0b0c0f", near: 10, far: 45 },
    bg: "#0b0c0f",
    accent: "#ffffff",
    floorTexture: "concretePolished",
    floorColor: "#12151a",
    reflectiveFloor: true,
  },
  warehouse: {
    hdri: "warehouse",
    exposure: 0.95,
    fog: { color: "#1a1a1d", near: 12, far: 42 },
    bg: "#171a1f",
    accent: "#ffb06b",
    floorTexture: "concretePolished",
    floorColor: "#15171b",
    reflectiveFloor: true,
  },
  outdoor_path: {
    hdri: "park",
    exposure: 1.15,
    fog: { color: "#1a241f", near: 14, far: 55 },
    bg: "#1b2420",
    accent: "#8ee089",
    floorTexture: "forestGround",
    floorColor: "#1d2b1d",
    reflectiveFloor: false,
  },
  tabletop: {
    hdri: "apartment",
    exposure: 1.05,
    fog: { color: "#1c1915", near: 8, far: 30 },
    bg: "#18150f",
    accent: "#ffc27a",
    floorTexture: "woodFloor",
    floorColor: "#2a1d10",
    reflectiveFloor: false,
  },
  flight_space: {
    hdri: "night",
    exposure: 0.9,
    fog: { color: "#0a0a12", near: 12, far: 50 },
    bg: "#06080e",
    accent: "#6ec1ff",
    floorTexture: "concretePolished",
    floorColor: "#0a0b12",
    reflectiveFloor: true,
  },
};

export function Viewport({ projectId }: { projectId: string }) {
  const project = useProjectsStore((s) => s.projects[projectId]);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerTab = useAppStore((s) => s.setDrawerTab);
  const [playing, setPlaying] = useState(true);
  const [fps, setFps] = useState(60);
  const [quality, setQuality] = useState<RenderQuality>("balanced");

  useEffect(() => {
    detectQuality().then(setQuality);
  }, []);

  const env: EnvironmentType =
    project?.environment ?? project?.robotSpec?.environment ?? "empty";
  const backdrop = ENV_BACKDROPS[env];
  const q = QUALITY[quality];

  return (
    <div className="absolute inset-0 bg-viewport-bg overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [5.5, 3.4, 5.5], fov: 38 }}
        dpr={q.dpr}
        gl={{
          antialias: false, // SMAA handles this
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: backdrop.exposure,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={[backdrop.bg]} />
        <fog
          attach="fog"
          args={[backdrop.fog.color, backdrop.fog.near, backdrop.fog.far]}
        />

        <Suspense fallback={null}>
          <Environment preset={backdrop.hdri} />

          {/* Lights */}
          <ambientLight intensity={0.1} />
          <hemisphereLight
            args={[backdrop.accent, backdrop.fog.color, 0.2]}
          />
          <directionalLight
            position={[6, 10, 4]}
            intensity={1.35}
            color={"#fff5e6"}
            castShadow
            shadow-mapSize={[q.shadowMapSize, q.shadowMapSize]}
            shadow-bias={-0.0002}
            shadow-normalBias={0.03}
          >
            <orthographicCamera
              attach="shadow-camera"
              args={[-10, 10, 10, -10, 0.1, 50]}
            />
          </directionalLight>
          <spotLight
            position={[-6, 7, -4]}
            intensity={0.4}
            angle={0.8}
            penumbra={0.8}
            color={backdrop.accent}
          />

          <PBRFloor
            textureKey={q.enablePBRFloor ? backdrop.floorTexture : "concretePolished"}
            reflective={backdrop.reflectiveFloor}
            fallbackColor={backdrop.floorColor}
            anisotropy={quality === "cinema" ? 16 : 8}
          />

          <EnvironmentProps
            env={env}
            accent={backdrop.accent}
            areaLights={q.enableAreaLights}
          />

          <group position={[0, 0, 0]}>
            <RobotPlaceholder
              category={project?.robotSpec?.category ?? "mobile_ground"}
              playing={playing}
              onFps={setFps}
            />
            <ContactShadows
              position={[0, 0.002, 0]}
              opacity={0.7}
              scale={10}
              blur={q.contactShadowsBlur}
              far={4}
              resolution={q.contactShadowsResolution}
              color="#000000"
              frames={1}
            />
          </group>

          <Sparkles
            count={q.sparklesCount}
            size={2}
            scale={[14, 5, 14]}
            speed={0.25}
            opacity={0.35}
            color={backdrop.accent}
          />

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={2.5}
            maxDistance={24}
            maxPolarAngle={Math.PI / 2.08}
            target={[0, 0.4, 0]}
          />
          <CameraDrift />

          <PostFX q={q} />
        </Suspense>
      </Canvas>

      {/* Top chrome */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <EnvironmentPicker projectId={projectId} />
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-secondary/70 backdrop-blur border border-border-primary/50 text-xs font-mono text-text-tertiary">
            {fps.toFixed(0)} FPS · {quality}
          </div>
          <div className="flex items-center gap-1 px-1 py-1 rounded-md bg-bg-secondary/70 backdrop-blur border border-border-primary/50">
            <QualityButton
              current={quality}
              onChange={setQuality}
            />
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
      title={tooltip}
      onClick={onClick}
      className="h-7 w-7 rounded inline-flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
    >
      {children}
    </button>
  );
}

function QualityButton({
  current,
  onChange,
}: {
  current: RenderQuality;
  onChange: (q: RenderQuality) => void;
}) {
  const cycle: Record<RenderQuality, RenderQuality> = {
    lite: "balanced",
    balanced: "cinema",
    cinema: "lite",
  };
  return (
    <button
      aria-label="Render quality"
      title={`Render quality: ${current} (click to cycle)`}
      onClick={() => onChange(cycle[current])}
      className="px-2 h-7 rounded text-[11px] font-mono text-text-secondary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro uppercase tracking-wider"
    >
      {current}
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

// ————————————————————————————————————————————————————————————
// Props per environment
// ————————————————————————————————————————————————————————————
function EnvironmentProps({
  env,
  accent,
  areaLights,
}: {
  env: EnvironmentType;
  accent: string;
  areaLights: boolean;
}) {
  if (env === "warehouse")
    return <WarehouseProps accent={accent} areaLights={areaLights} />;
  if (env === "outdoor_path") return <OutdoorProps />;
  if (env === "tabletop") return <TabletopProps areaLights={areaLights} />;
  if (env === "flight_space") return <FlightProps accent={accent} />;
  return <EmptyProps />;
}

function EmptyProps() {
  return (
    <Grid
      args={[80, 80]}
      cellSize={0.5}
      cellThickness={0.35}
      cellColor="#1c1c20"
      sectionSize={5}
      sectionThickness={0.75}
      sectionColor="#2a2a30"
      fadeDistance={32}
      fadeStrength={1.2}
      infiniteGrid
      position={[0, 0.005, 0]}
    />
  );
}

function WarehouseProps({
  accent,
  areaLights,
}: {
  accent: string;
  areaLights: boolean;
}) {
  return (
    <group>
      {/* Shelves */}
      {[4.5, -4.5].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh castShadow receiveShadow position={[0, 1.3, 0]}>
            <boxGeometry args={[0.35, 2.6, 8]} />
            <meshStandardMaterial
              color="#3b3e44"
              metalness={0.65}
              roughness={0.55}
            />
          </mesh>
          {[0.5, 1.4, 2.3].map((y, j) => (
            <mesh
              key={j}
              castShadow
              receiveShadow
              position={[0, y, 0]}
            >
              <boxGeometry args={[1.2, 0.05, 7.9]} />
              <meshStandardMaterial color="#5a5d63" metalness={0.6} roughness={0.45} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Pallets */}
      {[
        [1.6, 0.1, 2.4],
        [-1.8, 0.1, -2.6],
        [2.2, 0.1, -1.4],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.1, 0.15, 1.1]} />
            <meshStandardMaterial color="#70552e" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[0.9, 0.55, 0.9]} />
            <meshStandardMaterial color="#a8905b" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Crates stacked near far wall */}
      <group position={[0, 0, -6]}>
        {[
          [0, 0.3, 0],
          [-0.7, 0.3, 0.3],
          [0.7, 0.3, -0.3],
          [0, 0.9, 0],
        ].map((p, i) => (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={p as [number, number, number]}
          >
            <boxGeometry args={[0.6, 0.55, 0.6]} />
            <meshStandardMaterial color="#8c6a3f" roughness={0.92} />
          </mesh>
        ))}
      </group>
      {/* Ceiling light strips */}
      <group position={[0, 5.5, 0]}>
        {[-2.5, 2.5].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.3, 0.06, 8]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={3.2}
                toneMapped={false}
              />
            </mesh>
            {areaLights && <CeilingAreaLight color={accent} />}
          </group>
        ))}
      </group>
    </group>
  );
}

function CeilingAreaLight({ color }: { color: string }) {
  const ref = useRef<RectAreaLight>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.lookAt(0, 0, 0);
  }, []);
  return (
    <rectAreaLight
      ref={ref}
      args={[color, 4, 0.4, 8]}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}

function OutdoorProps() {
  const rocks = useMemo(
    () =>
      new Array(14).fill(0).map((_, i) => ({
        id: i,
        x: (Math.sin(i * 2.3) + Math.cos(i * 1.1)) * 4.5,
        z: (Math.cos(i * 1.7) - Math.sin(i * 2.9)) * 4.5,
        s: 0.15 + ((i * 0.37) % 0.25),
        c: i % 3 === 0 ? "#7a776f" : i % 3 === 1 ? "#61605a" : "#4d4c47",
      })),
    [],
  );
  const trees = useMemo(
    () =>
      new Array(8).fill(0).map((_, i) => ({
        id: i,
        x: Math.sin(i * 1.9) * 9 + (i % 2 ? 2 : -2),
        z: Math.cos(i * 2.2) * 9 + (i % 2 ? -3 : 3),
        h: 2.2 + (i % 3) * 0.4,
      })),
    [],
  );
  return (
    <group>
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.01, 24]} />
        <meshStandardMaterial color="#4a3926" roughness={1} />
      </mesh>
      {new Array(14).fill(0).map((_, i) => (
        <mesh
          key={i}
          position={[
            (i % 2 === 0 ? 1.3 : -1.3) + Math.sin(i) * 0.3,
            0.02,
            i * 1.8 - 12,
          ]}
          receiveShadow
        >
          <planeGeometry args={[0.4, 0.2]} />
          <meshStandardMaterial color="#3b5b35" roughness={1} />
        </mesh>
      ))}
      {rocks.map((r) => (
        <mesh
          key={r.id}
          castShadow
          receiveShadow
          position={[r.x, r.s * 0.6, r.z]}
        >
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color={r.c} roughness={0.95} />
        </mesh>
      ))}
      {trees.map((t) => (
        <group key={t.id} position={[t.x, 0, t.z]}>
          <mesh castShadow position={[0, t.h / 2, 0]}>
            <cylinderGeometry args={[0.08, 0.12, t.h, 8]} />
            <meshStandardMaterial color="#4a3220" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, t.h + 0.3, 0]}>
            <coneGeometry args={[0.55, 1.1, 8]} />
            <meshStandardMaterial color="#2d4c2b" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0, t.h + 1.15, 0]}>
            <coneGeometry args={[0.4, 0.9, 8]} />
            <meshStandardMaterial color="#35583a" roughness={0.95} />
          </mesh>
        </group>
      ))}
      <group position={[2, 0, 2.5]}>
        <mesh castShadow position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
          <meshStandardMaterial color="#332619" />
        </mesh>
        <mesh castShadow position={[0.25, 1.05, 0]}>
          <boxGeometry args={[0.5, 0.25, 0.04]} />
          <meshStandardMaterial color="#6a4a24" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function TabletopProps({ areaLights }: { areaLights: boolean }) {
  return (
    <group>
      {/* Table */}
      <group position={[0, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.76, 0]}>
          <boxGeometry args={[2.4, 0.08, 1.3]} />
          <meshPhysicalMaterial
            color="#6b4a2c"
            roughness={0.55}
            metalness={0.05}
            clearcoat={0.35}
            clearcoatRoughness={0.35}
          />
        </mesh>
        {[
          [1.1, 0.38, 0.55],
          [-1.1, 0.38, 0.55],
          [1.1, 0.38, -0.55],
          [-1.1, 0.38, -0.55],
        ].map((p, i) => (
          <mesh
            key={i}
            castShadow
            position={p as [number, number, number]}
          >
            <boxGeometry args={[0.08, 0.76, 0.08]} />
            <meshStandardMaterial color="#3a281a" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* Props on the table */}
      <Float floatIntensity={0.15} speed={1.5} rotationIntensity={0.2}>
        <mesh castShadow position={[0.4, 0.86, 0.05]}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshPhysicalMaterial
            color="#d94438"
            roughness={0.3}
            metalness={0.05}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
          />
        </mesh>
      </Float>
      <mesh castShadow position={[0, 0.86, 0.22]}>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 20]} />
        <meshPhysicalMaterial
          color="#3a75e0"
          roughness={0.25}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
        />
      </mesh>
      <mesh castShadow position={[-0.32, 0.88, -0.08]}>
        <sphereGeometry args={[0.06, 24, 18]} />
        <meshPhysicalMaterial
          color="#4ec77a"
          roughness={0.2}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
        />
      </mesh>
      {/* Ceramic mug */}
      <group position={[-0.7, 0.82, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.11, 28]} />
          <meshPhysicalMaterial
            color="#f2ece0"
            roughness={0.35}
            clearcoat={0.6}
          />
        </mesh>
        <mesh castShadow position={[0.065, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.04, 0.01, 8, 16, Math.PI]} />
          <meshPhysicalMaterial color="#f2ece0" roughness={0.35} />
        </mesh>
      </group>
      {/* Hardcover book */}
      <group position={[0.7, 0.82, -0.25]} rotation={[0, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.03, 0.3]} />
          <meshPhysicalMaterial color="#2a2e45" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 0.016, 0]}>
          <boxGeometry args={[0.21, 0.002, 0.29]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
      </group>
      {/* Laptop silhouette */}
      <group position={[-0.2, 0.83, -0.38]} rotation={[0, 0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.015, 0.28]} />
          <meshPhysicalMaterial
            color="#1a1a1a"
            roughness={0.35}
            metalness={0.6}
            clearcoat={0.5}
          />
        </mesh>
        <mesh castShadow position={[0, 0.12, -0.12]} rotation={[-1.35, 0, 0]}>
          <boxGeometry args={[0.4, 0.25, 0.008]} />
          <meshStandardMaterial
            color="#0a0a0a"
            emissive="#1a2a3a"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      {/* Pendant lamp */}
      <group position={[-1.1, 0.8, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.1, 0.03, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.7, 8]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
        </mesh>
        <mesh castShadow position={[0, 0.75, 0]}>
          <coneGeometry args={[0.14, 0.2, 24, 1, true]} />
          <meshStandardMaterial
            color="#e6b470"
            emissive="#ffb366"
            emissiveIntensity={1.2}
            side={THREE.DoubleSide}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          position={[0, 0.7, 0]}
          intensity={3.5}
          color="#ffb37a"
          distance={3.5}
          decay={2}
          castShadow={false}
        />
        {areaLights && (
          <rectAreaLight
            args={["#ffb37a", 2.5, 0.28, 0.28]}
            position={[0, 0.62, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        )}
      </group>
    </group>
  );
}

function FlightProps({ accent }: { accent: string }) {
  const markers = [
    { p: [0, 0.5, 10] as [number, number, number], c: "#e04d55" },
    { p: [10, 0.5, 0] as [number, number, number], c: "#55d47b" },
    { p: [0, 0.5, -10] as [number, number, number], c: "#5494e0" },
    { p: [-10, 0.5, 0] as [number, number, number], c: "#e0c258" },
  ];
  return (
    <group>
      {markers.map((m, i) => (
        <group key={i} position={m.p}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
            <meshStandardMaterial
              color={m.c}
              emissive={m.c}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          <pointLight color={m.c} intensity={1.5} distance={5} decay={2} />
        </group>
      ))}
      {/* Hoop */}
      <group position={[0, 1.4, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow>
          <torusGeometry args={[1.2, 0.05, 12, 64]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ————————————————————————————————————————————————————————————
// Gentle camera breathing
// ————————————————————————————————————————————————————————————
function CameraDrift() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x += Math.sin(t * 0.1) * 0.0008;
    camera.position.y += Math.sin(t * 0.13) * 0.0006;
  });
  return null;
}

// ————————————————————————————————————————————————————————————
// Robot placeholder
// ————————————————————————————————————————————————————————————
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
      ref.current.position.y = 1.35 + Math.sin(t * 2.2) * 0.11;
      ref.current.rotation.y = t * 0.5;
      ref.current.rotation.z = Math.sin(t * 1.8) * 0.05;
    } else if (category === "manipulator_arm") {
      ref.current.rotation.y = Math.sin(t * 0.7) * 0.5;
    } else if (category === "humanoid" || category === "quadruped") {
      ref.current.position.y = MathUtils.lerp(
        ref.current.position.y,
        0.12 + Math.sin(t * 2.5) * 0.02,
        0.2,
      );
    } else {
      ref.current.position.x = Math.sin(t * 0.55) * 1.8;
      ref.current.rotation.y = t * 0.18;
    }
  });

  return (
    <group ref={ref} position={[0, 0.2, 0]}>
      {category === "mobile_aerial" ? (
        <DroneMesh />
      ) : category === "manipulator_arm" ? (
        <ArmMesh />
      ) : (
        <WheeledMesh />
      )}
    </group>
  );
}

function WheeledMesh() {
  const wheelsRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (wheelsRef.current) wheelsRef.current.rotation.x += delta * 6;
  });

  return (
    <group>
      {/* Chassis — painted metal clearcoat */}
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.7, 0.22, 0.95]} />
        <meshPhysicalMaterial
          color="#f0f0f0"
          metalness={0.35}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.18}
        />
      </mesh>
      {/* Top bay */}
      <mesh castShadow position={[0, 0.4, 0.05]}>
        <boxGeometry args={[0.38, 0.14, 0.38]} />
        <meshPhysicalMaterial
          color="#0e0e10"
          metalness={0.85}
          roughness={0.18}
          clearcoat={0.8}
        />
      </mesh>
      {/* Camera stalk */}
      <mesh castShadow position={[0, 0.55, 0.3]}>
        <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.68, 0.3]}>
        <boxGeometry args={[0.12, 0.06, 0.06]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.6}
          emissive="#5ac3ff"
          emissiveIntensity={1.1}
          roughness={0.15}
          toneMapped={false}
        />
      </mesh>
      {/* Lidar */}
      <mesh castShadow position={[0, 0.52, -0.05]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 24]} />
        <meshStandardMaterial
          color="#2a2a2d"
          metalness={0.55}
          roughness={0.3}
          emissive="#4aa7ff"
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>
      {/* Status light on top */}
      <mesh position={[0, 0.475, 0.05]}>
        <sphereGeometry args={[0.012, 12, 10]} />
        <meshStandardMaterial
          emissive="#5af090"
          emissiveIntensity={4}
          toneMapped={false}
          color="#5af090"
        />
      </mesh>
      {/* Wheels */}
      <group ref={wheelsRef}>
        {[
          [-0.38, 0.13, -0.32],
          [0.38, 0.13, -0.32],
          [-0.38, 0.13, 0.32],
          [0.38, 0.13, 0.32],
        ].map((p, i) => (
          <group key={i} position={p as [number, number, number]}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.09, 24]} />
              <meshStandardMaterial
                color="#0c0c0c"
                roughness={0.95}
                metalness={0.1}
              />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.095, 16]} />
              <meshPhysicalMaterial
                color="#e6e6e6"
                metalness={0.9}
                roughness={0.15}
                clearcoat={0.5}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function ArmMesh() {
  const base = useRef<Group>(null);
  const upper = useRef<Group>(null);
  const fore = useRef<Group>(null);
  useFrame((_, delta) => {
    if (base.current) base.current.rotation.y += delta * 0.3;
    if (upper.current)
      upper.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.3 - 0.4;
    if (fore.current)
      fore.current.rotation.x = Math.sin(Date.now() * 0.0013) * 0.4 + 0.3;
  });
  return (
    <group position={[0, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.1, 32]} />
        <meshPhysicalMaterial
          color="#1a1a1c"
          metalness={0.85}
          roughness={0.22}
          clearcoat={0.8}
        />
      </mesh>
      <group ref={base} position={[0, 0.1, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.2, 0.15, 24]} />
          <meshPhysicalMaterial
            color="#d8d8d8"
            metalness={0.6}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.15}
          />
        </mesh>
        <group ref={upper} position={[0, 0.12, 0]}>
          <mesh castShadow position={[0, 0.3, 0]}>
            <boxGeometry args={[0.14, 0.65, 0.14]} />
            <meshPhysicalMaterial
              color="#bababa"
              metalness={0.55}
              roughness={0.22}
              clearcoat={0.8}
            />
          </mesh>
          <group ref={fore} position={[0, 0.65, 0]}>
            <mesh castShadow position={[0, 0.25, 0]}>
              <boxGeometry args={[0.11, 0.55, 0.11]} />
              <meshPhysicalMaterial
                color="#e8e8e8"
                metalness={0.55}
                roughness={0.2}
                clearcoat={0.9}
              />
            </mesh>
            <group position={[0, 0.55, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.16, 0.06, 0.16]} />
                <meshPhysicalMaterial color="#1a1a1c" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh castShadow position={[0.04, 0.08, 0]}>
                <boxGeometry args={[0.02, 0.1, 0.05]} />
                <meshStandardMaterial color="#1a1a1c" metalness={0.8} />
              </mesh>
              <mesh castShadow position={[-0.04, 0.08, 0]}>
                <boxGeometry args={[0.02, 0.1, 0.05]} />
                <meshStandardMaterial color="#1a1a1c" metalness={0.8} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function DroneMesh() {
  const rotors = [
    [0.42, 0.1, 0.42],
    [-0.42, 0.1, 0.42],
    [0.42, 0.1, -0.42],
    [-0.42, 0.1, -0.42],
  ];
  return (
    <group position={[0, 0.8, 0]}>
      <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1.2, 0.04, 0.08]} />
        <meshPhysicalMaterial
          color="#161616"
          metalness={0.7}
          roughness={0.3}
          clearcoat={0.6}
        />
      </mesh>
      <mesh castShadow rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[1.2, 0.04, 0.08]} />
        <meshPhysicalMaterial
          color="#161616"
          metalness={0.7}
          roughness={0.3}
          clearcoat={0.6}
        />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.08, 0.28]} />
        <meshPhysicalMaterial
          color="#e6e6e6"
          metalness={0.6}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </mesh>
      <mesh castShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.22, 0.04, 0.22]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.7}
          emissive="#5ac3ff"
          emissiveIntensity={1.2}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
      {rotors.map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
            <meshStandardMaterial
              color="#161616"
              metalness={0.75}
              roughness={0.3}
            />
          </mesh>
          <SpinningRotor />
          {/* Status LEDs: green front, red rear */}
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.01, 10, 8]} />
            <meshStandardMaterial
              emissive={i < 2 ? "#5af090" : "#ff5a5a"}
              emissiveIntensity={6}
              toneMapped={false}
              color={i < 2 ? "#5af090" : "#ff5a5a"}
            />
          </mesh>
          <pointLight
            position={[0, -0.1, 0]}
            intensity={0.8}
            color={i < 2 ? "#5af090" : "#ff5a5a"}
            distance={0.8}
          />
        </group>
      ))}
    </group>
  );
}

function SpinningRotor() {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 38;
  });
  return (
    <group ref={ref} position={[0, 0.08, 0]}>
      <mesh>
        <boxGeometry args={[0.55, 0.004, 0.03]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}
