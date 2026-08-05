import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { roomGrowthState } from '../../lib/roomGrowthState';
import { ScrambleText3D } from './ScrambleText3D';

const ROOM_SIZE: [number, number, number] = [3.2, 2, 2.2];

const STATS: { text: string; triggerProgress: number; position: [number, number, number] }[] = [
  { text: 'MASSING STUDY', triggerProgress: 0.05, position: [0, 1.5, 0] },
  { text: '3 WEEK AVG TIMELINE', triggerProgress: 0.4, position: [-2.5, -0.3, 0.6] },
  { text: 'LOCAL, LICENSED CREW', triggerProgress: 0.75, position: [2.3, -0.7, -0.4] },
];

/**
 * Renovation demo's spatial hero: a single room volume that grows from a
 * small wireframe study into a full-size, lit standard-material solid as
 * the page scrolls through the "massing" section — progress driven by
 * useRoomGrowthScroll's GSAP ScrollTrigger via the shared roomGrowthState
 * module (same imperative-read-in-useFrame pattern as scrollState in
 * useLenis.ts). WebGL stat labels scramble in at fixed progress
 * thresholds via ScrambleText3D. Replaces the old drag-driven
 * wireframe/solid reveal shader (useRevealDrag) with a scroll-native one.
 */
export function NicheShaderHero_Architecture() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const solidRef = useRef<THREE.MeshStandardMaterial>(null);
  const wireRef = useRef<THREE.LineBasicMaterial>(null);

  const boxGeometry = useMemo(() => new THREE.BoxGeometry(...ROOM_SIZE), []);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(boxGeometry), [boxGeometry]);

  // The camera is shared (GlobalCanvas mounts one Canvas for every route),
  // so drifting it here for parallax has to be undone on unmount — otherwise
  // the offset leaks into the particle field or another niche hero.
  useEffect(() => {
    const initialPosition = camera.position.clone();
    return () => {
      camera.position.copy(initialPosition);
      camera.lookAt(0, 0, 0);
    };
  }, [camera]);

  useFrame((state) => {
    const progress = roomGrowthState.progress;
    const group = groupRef.current;
    if (group) {
      group.scale.setScalar(0.35 + progress * 0.65);
      group.rotation.y = -0.3 + progress * 0.5 + Math.sin(state.clock.getElapsedTime() * 0.12) * 0.03;
    }

    // Solidify (wireframe → standard material) over the back half of the
    // scroll range, so "grow" reads first and "solidify" finishes it.
    const solidify = THREE.MathUtils.clamp((progress - 0.45) / 0.4, 0, 1);
    if (solidRef.current) solidRef.current.opacity = solidify;
    if (wireRef.current) wireRef.current.opacity = 1 - solidify * 0.85;

    // Slight camera orbit for parallax depth as the user scrolls.
    const targetX = Math.sin(progress * Math.PI * 0.6) * 1.1;
    const targetY = 0.3 + progress * 0.9;
    camera.position.x += (targetX - camera.position.x) * 0.06;
    camera.position.y += (targetY - camera.position.y) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group rotation={[0, -0.3, 0]}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color="#66fcf1" />
      <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#45a29e" />

      <group ref={groupRef}>
        <mesh geometry={boxGeometry}>
          <meshStandardMaterial
            ref={solidRef}
            color="#45a29e"
            roughness={0.35}
            metalness={0.15}
            transparent
            opacity={0}
          />
        </mesh>
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial ref={wireRef} color="#66fcf1" transparent opacity={1} />
        </lineSegments>
      </group>

      {STATS.map((s) => (
        <ScrambleText3D key={s.text} {...s} />
      ))}
    </group>
  );
}
