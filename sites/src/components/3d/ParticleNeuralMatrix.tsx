import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleNeuralMatrixProps {
  /** True while the AI is generating personalized copy. Drives the
   * idle → vortex transition; the falling edge (active → inactive)
   * triggers the burst/release. */
  active: boolean;
  count?: number;
}

const IDLE_COLOR = new THREE.Color('#2a3538');
const ACTIVE_COLOR = new THREE.Color('#66fcf1');

/**
 * A 3D particle field that idles as a loose, slowly-rotating sphere and
 * tightens into a vortex while `active` is true — a visual stand-in for
 * "the AI is thinking." When `active` flips back to false, the vortex
 * releases outward in a brief radial burst before settling back to idle.
 *
 * Positions are computed each frame from each particle's fixed spherical
 * "home" coordinate plus a small set of scalar progress values (vortex
 * tightening, burst impulse) rather than stored per-particle velocity —
 * simpler to reason about and keeps this a pure function of time + state.
 */
export function ParticleNeuralMatrix({ active, count = 2200 }: ParticleNeuralMatrixProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const vortexProgress = useRef(0); // 0 = idle sphere, 1 = fully tightened vortex
  const burstProgress = useRef(1); // 0 = mid-burst, 1 = settled (no burst in flight)
  const wasActive = useRef(false);

  // Each particle's fixed "home" position on a sphere shell, plus a
  // per-particle phase offset so the idle drift doesn't look uniform.
  const { basePositions, phases } = useMemo(() => {
    const base = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 3.2 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      base[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      base[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      base[i * 3 + 2] = radius * Math.cos(phi);
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { basePositions: base, phases: ph };
  }, [count]);

  const positions = useMemo(() => basePositions.slice(), [basePositions]);
  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      IDLE_COLOR.toArray(c, i * 3);
    }
    return c;
  }, [count]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    // Ease vortex progress toward its target (1 while active, 0 while idle).
    const target = active ? 1 : 0;
    vortexProgress.current += (target - vortexProgress.current) * Math.min(1, delta * 2.2);

    // Falling edge (was active, now inactive): kick off a burst.
    if (wasActive.current && !active) {
      burstProgress.current = 0;
    }
    wasActive.current = active;
    if (burstProgress.current < 1) {
      burstProgress.current = Math.min(1, burstProgress.current + delta * 1.4);
    }

    const t = state.clock.getElapsedTime();
    const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = points.geometry.attributes.color as THREE.BufferAttribute;
    const vortex = vortexProgress.current;
    // Burst impulse: peaks right at the start of the burst window, decays to 0.
    const burstImpulse = (1 - burstProgress.current) * 1.8;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const bx = basePositions[ix];
      const by = basePositions[ix + 1];
      const bz = basePositions[ix + 2];
      const phase = phases[i];

      // Idle drift: gentle whole-field rotation + per-particle bob.
      const idleAngle = t * 0.08 + phase;
      const idleX = bx * Math.cos(idleAngle * 0.15) - bz * Math.sin(idleAngle * 0.15);
      const idleZ = bx * Math.sin(idleAngle * 0.15) + bz * Math.cos(idleAngle * 0.15);
      const idleY = by + Math.sin(t * 0.6 + phase) * 0.08;

      // Vortex target: pull toward a tight spiral around the Y axis,
      // spinning faster than the idle drift.
      const radius = Math.hypot(bx, bz);
      const spiralAngle = phase + t * 2.4 + radius * 0.6;
      const vortexRadius = radius * (1 - vortex * 0.72);
      const vortexX = Math.cos(spiralAngle) * vortexRadius;
      const vortexZ = Math.sin(spiralAngle) * vortexRadius;
      const vortexY = by * (1 - vortex * 0.5) + Math.sin(t * 3 + phase) * vortex * 0.15;

      const mixedX = idleX + (vortexX - idleX) * vortex;
      const mixedY = idleY + (vortexY - idleY) * vortex;
      const mixedZ = idleZ + (vortexZ - idleZ) * vortex;

      // Burst impulse pushes particles outward along their own base direction.
      const dirLen = Math.hypot(bx, by, bz) || 1;
      const burstX = (bx / dirLen) * burstImpulse;
      const burstY = (by / dirLen) * burstImpulse;
      const burstZ = (bz / dirLen) * burstImpulse;

      posAttr.setXYZ(i, mixedX + burstX, mixedY + burstY, mixedZ + burstZ);

      // Color: idle grey → accent pink as vortex tightens, plus a hot flash on burst.
      const colorMix = Math.min(1, vortex + burstImpulse * 0.6);
      const r = IDLE_COLOR.r + (ACTIVE_COLOR.r - IDLE_COLOR.r) * colorMix;
      const g = IDLE_COLOR.g + (ACTIVE_COLOR.g - IDLE_COLOR.g) * colorMix;
      const b = IDLE_COLOR.b + (ACTIVE_COLOR.b - IDLE_COLOR.b) * colorMix;
      colorAttr.setXYZ(i, r, g, b);
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    points.rotation.y = t * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
