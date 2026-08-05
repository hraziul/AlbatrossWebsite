import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Iridescent glass crystals for the Dental demo's hero backdrop.
 *
 * Two techniques here are stylized approximations, not physically
 * simulated effects — worth knowing if this gets extended:
 * - "Subsurface scattering": true SSS needs a screen-space or volumetric
 *   pass. This uses a Fresnel-based rim-glow shell (a slightly larger,
 *   backface-culled duplicate of each crystal, additive-blended) — a
 *   standard cheap trick that reads as light bleeding through glass edges.
 * - "Caustics": real caustics need render-to-texture light-refraction
 *   passes. This uses an animated procedural sine-wave pattern on a
 *   backdrop plane — the common real-time "fake it" technique, not
 *   raytraced light transport.
 */

const FRESNEL_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRESNEL_FRAGMENT = `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.5);
    gl_FragColor = vec4(uColor, fresnel * 0.55);
  }
`;

const CAUSTICS_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CAUSTICS_FRAGMENT = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  float caustic(vec2 uv, float t) {
    vec2 p = uv * 6.0;
    float c = 0.0;
    c += sin(p.x + t) * sin(p.y - t * 0.8);
    c += sin(p.x * 1.6 - t * 1.3) * sin(p.y * 1.4 + t * 0.6);
    c += sin((p.x + p.y) * 1.1 + t * 0.5);
    return smoothstep(0.4, 1.0, c * 0.33 + 0.5);
  }

  void main() {
    float pattern = caustic(vUv, uTime);
    float fade = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.55, vUv.y)
      * smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
    gl_FragColor = vec4(uColor, pattern * fade * 0.3);
  }
`;

const ACCENT = new THREE.Color('#3FA9C7');

interface CrystalConfig {
  position: [number, number, number];
  scale: number;
  geometry: 'icosahedron' | 'octahedron';
}

const CRYSTALS: CrystalConfig[] = [
  { position: [-2.2, 0.6, -0.5], scale: 1.05, geometry: 'icosahedron' },
  { position: [1.8, -0.4, 0.3], scale: 0.85, geometry: 'octahedron' },
  { position: [0.2, 1.2, -1.2], scale: 0.6, geometry: 'icosahedron' },
  { position: [-1.1, -1.1, 0.4], scale: 0.5, geometry: 'octahedron' },
  { position: [2.6, 1.0, -1.0], scale: 0.4, geometry: 'icosahedron' },
];

function Crystal({ position, scale, geometry }: CrystalConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const fresnelMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: FRESNEL_VERTEX,
        fragmentShader: FRESNEL_FRAGMENT,
        uniforms: { uColor: { value: ACCENT } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    // Gently tilt each crystal toward the cursor — smoothed, not snapped.
    const targetX = state.pointer.y * 0.3;
    const targetY = state.pointer.x * 0.3;
    group.rotation.x += (targetX - group.rotation.x) * 0.04;
    group.rotation.y += (targetY - group.rotation.y) * 0.04;
  });

  const Geometry = geometry === 'icosahedron' ? 'icosahedronGeometry' : 'octahedronGeometry';

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.1}>
      <group ref={groupRef} position={position} scale={scale}>
        <mesh>
          <Geometry args={[1, 0]} />
          <MeshTransmissionMaterial
            transmission={1}
            thickness={0.6}
            roughness={0.04}
            chromaticAberration={0.06}
            anisotropy={0.15}
            distortion={0.15}
            distortionScale={0.3}
            temporalDistortion={0.1}
            ior={1.4}
            color="#eaf7fb"
            resolution={256}
            samples={4}
          />
        </mesh>
        {/* Fresnel rim shell — the SSS approximation described above. */}
        <mesh scale={1.12} material={fresnelMaterial}>
          <Geometry args={[1, 0]} />
        </mesh>
      </group>
    </Float>
  );
}

function CausticsBackdrop() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, -3]} scale={[10, 6, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={CAUSTICS_VERTEX}
        fragmentShader={CAUSTICS_FRAGMENT}
        uniforms={{ uTime: { value: 0 }, uColor: { value: ACCENT } }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    const light = lightRef.current;
    if (!light) return;
    const targetX = state.pointer.x * viewport.width * 0.5;
    const targetY = state.pointer.y * viewport.height * 0.5;
    light.position.x += (targetX - light.position.x) * 0.08;
    light.position.y += (targetY - light.position.y) * 0.08;
  });

  return <pointLight ref={lightRef} position={[0, 0, 2.5]} intensity={8} distance={8} color="#ffffff" />;
}

export function NicheShaderHero_Dental() {
  return (
    <group>
      <ambientLight intensity={0.25} />
      <MouseLight />
      <CausticsBackdrop />
      {CRYSTALS.map((c, i) => (
        <Crystal key={i} {...c} />
      ))}
      {/* Synthetic studio environment built from primitive light panels —
          gives MeshTransmissionMaterial reflections/refractions to read
          against without fetching an external HDRI preset over the network. */}
      <Environment resolution={128}>
        <group>
          <Lightformer form="rect" intensity={4} color="#3FA9C7" position={[-3, 2, -2]} scale={[3, 3, 1]} />
          <Lightformer form="rect" intensity={3} color="#eaf7fb" position={[3, -1, 1]} scale={[2, 4, 1]} />
          <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 3, 3]} scale={4} />
        </group>
      </Environment>
    </group>
  );
}
