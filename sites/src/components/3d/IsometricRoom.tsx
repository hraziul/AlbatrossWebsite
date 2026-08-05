import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box, Edges, Grid, useScroll, type EdgesRef } from '@react-three/drei';
import * as THREE from 'three';

const WIRE_COLOR = new THREE.Color('#66fcf1');
const SOLID_COLOR = new THREE.Color('#181a1f');

const FLOOR_ARGS: [number, number, number] = [10, 0.5, 10];
const WALL_HEIGHT = 6;
const WALL_THICKNESS = 0.5;
const HALF_FLOOR = FLOOR_ARGS[0] / 2;
const FLOOR_TOP_Y = FLOOR_ARGS[1] / 2;
const WALL_CENTER_Y = FLOOR_TOP_Y + WALL_HEIGHT / 2;

interface MorphingBoxProps {
  args: [number, number, number];
  position: [number, number, number];
}

/**
 * A single wall panel that reads as a clean cyan CAD outline at scroll 0
 * and a polished, near-black MeshStandardMaterial solid past the
 * midpoint. Uses drei's <Edges> — which auto-detects its parent mesh's
 * geometry and renders only the true structural edges — rather than the
 * material `wireframe` prop, which rasterizes every triangle including
 * each face's diagonal and reads as a messy debug view, not a line
 * drawing.
 */
function MorphingBox({ args, position }: MorphingBoxProps) {
  const solidRef = useRef<THREE.MeshStandardMaterial>(null);
  const edgesRef = useRef<EdgesRef>(null);
  const scroll = useScroll();

  useFrame(() => {
    // scroll.offset is already damped by ScrollControls itself, so no
    // extra per-frame easing is layered on top here.
    const solidify = THREE.MathUtils.clamp((scroll.offset - 0.15) / 0.5, 0, 1);
    if (solidRef.current) solidRef.current.opacity = solidify;
    // The outline stays on as a residual edge-highlight once solid,
    // rather than vanishing outright — reads as a finished CAD render
    // with edge emphasis, not a hard cut from "wireframe" to "solid".
    if (edgesRef.current) edgesRef.current.material.opacity = 1 - solidify * 0.75;
  });

  return (
    <Box args={args} position={position}>
      <meshStandardMaterial ref={solidRef} color={SOLID_COLOR} roughness={0.2} metalness={0.8} transparent opacity={0} />
      <Edges ref={edgesRef} color={WIRE_COLOR} threshold={15} transparent opacity={1} />
    </Box>
  );
}

/**
 * A stylized room corner: a drei <Grid> blueprint floor plus two wall
 * panels (<Box> + <Edges>) meeting at an interior corner. Reads
 * useScroll() (from the parent <ScrollControls>) to slowly rotate the
 * whole group on the Y axis for a cinematic parallax feel as the user
 * scrolls, while each MorphingBox independently drives its own
 * outline→solid crossfade off the same scroll offset.
 */
export function IsometricRoom() {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { camera } = useThree();

  // The Canvas's default camera only gets a position from RenovationPage,
  // not a rotation — r3f doesn't auto-orient it toward the origin, so
  // without this it just faces its default -Z direction and misses the
  // room entirely. Point it at the room's rough center once on mount.
  useEffect(() => {
    camera.lookAt(0, WALL_CENTER_Y, 0);
  }, [camera]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = scroll.offset * Math.PI * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floor: an architectural blueprint grid rather than a solid slab. */}
      <Grid
        position={[0, FLOOR_TOP_Y, 0]}
        args={[FLOOR_ARGS[0], FLOOR_ARGS[2]]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#3a4550"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#66fcf1"
        fadeDistance={18}
        fadeStrength={1.5}
        fadeFrom={0.4}
      />
      {/* Left wall: tall, flush with the floor's left edge. */}
      <MorphingBox
        args={[WALL_THICKNESS, WALL_HEIGHT, FLOOR_ARGS[2]]}
        position={[-HALF_FLOOR + WALL_THICKNESS / 2, WALL_CENTER_Y, 0]}
      />
      {/* Right wall: tall, flush with the floor's back edge, meeting the
          left wall at the room's interior corner. */}
      <MorphingBox
        args={[FLOOR_ARGS[0], WALL_HEIGHT, WALL_THICKNESS]}
        position={[0, WALL_CENTER_Y, -HALF_FLOOR + WALL_THICKNESS / 2]}
      />
    </group>
  );
}
