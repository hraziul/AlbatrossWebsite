import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '../../hooks/useLenis';

/**
 * A cinematic, flowing liquid-gold ribbon field for the Marriage Hall
 * demo's hero backdrop. Flow speed and rotation both respond to scroll
 * velocity (via `scrollState`, published by useLenis.ts from the app's
 * single Lenis instance — no second Lenis instance, no prop-drilling
 * through GlobalCanvas).
 *
 * The "bokeh" atmosphere is a stylized approximation, not true camera
 * depth-of-field: real DOF needs a post-processing blur pass sharing the
 * canvas's render loop, and GlobalCanvas is a single, persistent,
 * route-swapping Canvas shared by every niche — a composer taking over
 * that render loop from one niche's component risks fighting whichever
 * component is mounted after a route change. Soft glowing sprite
 * particles at varying depth/size read as "warm glowing bokeh" without
 * that risk.
 */

const RIBBON_VERTEX = `
  uniform float uTime;
  uniform float uFlowSpeed;
  uniform float uTwist;
  uniform float uAmplitude;
  uniform float uPhase;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float u = uv.x;

    float phase = u * 6.2831 * 1.5 + uTime * uFlowSpeed + uPhase;
    float flowY = sin(phase) * uAmplitude + sin(phase * 0.5 + 1.3) * uAmplitude * 0.5;
    float flowZ = cos(phase * 0.8) * uAmplitude * 0.6;

    // Twist the cross-section (the plane's thin local-y axis) around the
    // ribbon's tangent as it travels along its length — the classic
    // twisting-ribbon look. Normals aren't re-derived post-displacement
    // (would need neighbor-vertex sampling); at these amplitudes the
    // Fresnel highlight below still reads correctly, this is a deliberate
    // simplification for a stylized effect, not a physically exact one.
    float twistAngle = u * uTwist + uTime * 0.2 + uPhase;
    float cosT = cos(twistAngle);
    float sinT = sin(twistAngle);
    float localY = pos.y * cosT;
    float localZ = pos.y * sinT;

    pos.y = localY + flowY;
    pos.z = localZ + flowZ;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const RIBBON_FRAGMENT = `
  uniform float uTime;
  uniform vec3 uGold;
  uniform vec3 uAccent;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.0);
    float shimmer = sin(vUv.x * 20.0 + uTime * 1.5) * 0.5 + 0.5;
    vec3 color = mix(uGold, uAccent, fresnel * 0.5 + shimmer * 0.15);
    float glow = 0.35 + fresnel * 0.65;
    gl_FragColor = vec4(color * glow, 0.85);
  }
`;

const GOLD = new THREE.Color('#d4af6a');
const ACCENT = new THREE.Color('#8C1F3B');

interface RibbonConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  amplitude: number;
  twist: number;
  phase: number;
}

const RIBBONS: RibbonConfig[] = [
  { position: [0, 0.4, 0], rotation: [0, 0.2, 0], scale: 3.2, amplitude: 0.7, twist: 5.5, phase: 0 },
  { position: [-1.5, -0.8, -1], rotation: [0, -0.35, 0.1], scale: 2.4, amplitude: 0.5, twist: 4.2, phase: 2.1 },
  { position: [1.8, 0.9, -1.5], rotation: [0, 0.5, -0.15], scale: 2.0, amplitude: 0.45, twist: 6.8, phase: 4.4 },
];

function Ribbon({ position, rotation, scale, amplitude, twist, phase }: RibbonConfig) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const smoothedSpeed = useRef(0.4);

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 0.16, 160, 1), []);

  useFrame((state, delta) => {
    const material = materialRef.current;
    const group = groupRef.current;
    if (!material || !group) return;

    // Base idle flow, boosted by however fast the user is scrolling —
    // smoothed so a single scroll tick doesn't snap the ribbon's speed.
    const targetSpeed = 0.4 + Math.min(Math.abs(scrollState.velocity) * 0.15, 2.5);
    smoothedSpeed.current += (targetSpeed - smoothedSpeed.current) * Math.min(1, delta * 3);

    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uFlowSpeed.value = smoothedSpeed.current;

    // Scroll velocity also nudges the ribbon's own rotation, not just its
    // internal flow — a faster scroll visibly turns the whole ribbon.
    group.rotation.z += scrollState.velocity * 0.0008;
    group.rotation.y += delta * 0.02;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={RIBBON_VERTEX}
          fragmentShader={RIBBON_FRAGMENT}
          uniforms={{
            uTime: { value: 0 },
            uFlowSpeed: { value: 0.4 },
            uTwist: { value: twist },
            uAmplitude: { value: amplitude },
            uPhase: { value: phase },
            uGold: { value: GOLD },
            uAccent: { value: ACCENT },
          }}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function useBokehTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function BokehAtmosphere({ count = 60 }: { count?: number }) {
  const texture = useBokehTexture();
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const warmA = new THREE.Color('#d4af6a');
    const warmB = new THREE.Color('#8C1F3B');
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      const c = warmA.clone().lerp(warmB, Math.random());
      c.toArray(col, i * 3);
      siz[i] = 0.3 + Math.random() * 1.1;
    }
    return { positions: pos, colors: col, sizes: siz };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} count={count} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.8}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function NicheShaderHero_Venue() {
  return (
    <group>
      <ambientLight intensity={0.3} color="#3a2418" />
      <pointLight position={[3, 2, 3]} intensity={6} color="#f5c98a" distance={12} />
      <pointLight position={[-3, -1, 2]} intensity={3} color="#8C1F3B" distance={10} />
      <BokehAtmosphere />
      {RIBBONS.map((r, i) => (
        <Ribbon key={i} {...r} />
      ))}
    </group>
  );
}
