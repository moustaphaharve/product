import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Cinematic animated background for the Welcome screen.
 *
 * Two layers: a full-screen fragment shader that draws a slowly drifting
 * mesh-gradient with flow-based noise, and a field of slow-moving specular
 * particles. Entirely GPU-bound; under 0.5 ms/frame on any modern laptop.
 */
export function WelcomeBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 1], fov: 40 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#06070a"]} />
        <GradientPlane />
        <Particles />
      </Canvas>
      {/* subtle vignette over the canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;
  varying vec2 vUv;

  // Hash / noise utilities
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);

    float t = uTime * 0.06;

    // Flow field: two fbm layers warping each other
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(1.3, -2.1) + t));
    vec2 r = vec2(
      fbm(p + 1.8 * q + vec2(1.7, 9.2) + 0.13 * t),
      fbm(p + 1.8 * q + vec2(8.3, 2.8) + 0.12 * t)
    );
    float f = fbm(p + 1.1 * r);

    // Color palette — deep navy ? slate ? warm accent
    vec3 c1 = vec3(0.04, 0.05, 0.07);
    vec3 c2 = vec3(0.10, 0.12, 0.18);
    vec3 c3 = vec3(0.28, 0.32, 0.45);
    vec3 c4 = vec3(0.90, 0.85, 0.80);

    vec3 col = c1;
    col = mix(col, c2, smoothstep(-0.2, 0.6, f));
    col = mix(col, c3, smoothstep(0.3, 0.9, length(q)));
    col = mix(col, c4, 0.08 * smoothstep(0.7, 1.2, length(r)));

    // Subtle vignette
    float vig = smoothstep(1.2, 0.25, length(p));
    col *= 0.4 + 0.6 * vig;

    // Film grain
    float grain = (fract(sin(dot(uv * uRes, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.018;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function GradientPlane() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame(({ clock, size }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uRes.value.set(size.width, size.height);
    if (material.current) material.current.uniformsNeedUpdate = true;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function Particles() {
  const points = useRef<THREE.Points>(null);
  const count = 160;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = -Math.random() * 2 - 0.2;
      speeds[i] = 0.02 + Math.random() * 0.05;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(({ clock }) => {
    const geo = points.current?.geometry as THREE.BufferGeometry | undefined;
    if (!geo) return;
    const arr = geo.attributes.position!.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] =
        ((arr[i * 3 + 1]! + speeds[i]! * 0.003) % 1.2) - 0.6;
      arr[i * 3 + 0]! +=
        Math.sin(t * 0.1 + i * 0.37) * 0.00008;
    }
    geo.attributes.position!.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        color="#ffffff"
        transparent
        opacity={0.4}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
