import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { roomGrowthState } from '../../lib/roomGrowthState';

const SCRAMBLE_CHARS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*';
const SCRAMBLE_DURATION = 0.7;

interface ScrambleText3DProps {
  text: string;
  triggerProgress: number;
  position: [number, number, number];
  fontSize?: number;
  color?: string;
}

/**
 * A WebGL (drei/troika) text mesh that "decodes" from random glyphs into
 * its final string once roomGrowthState.progress crosses
 * `triggerProgress` — a text-scramble reveal gated by scroll position.
 * Mutates the underlying troika Text instance imperatively (mesh.text +
 * mesh.sync()) only for the ~0.7s scramble burst rather than every frame
 * forever; sync() re-lays-out glyphs, so calling it after the string has
 * settled would just be wasted work.
 */
export function ScrambleText3D({ text, triggerProgress, position, fontSize = 0.32, color = '#66fcf1' }: ScrambleText3DProps) {
  const textRef = useRef<{ text: string; sync: () => void } | null>(null);
  const elapsed = useRef(0);
  const started = useRef(false);
  const settled = useRef(false);

  useFrame((_, delta) => {
    if (settled.current) return;
    const mesh = textRef.current;
    if (!mesh) return;

    if (!started.current) {
      if (roomGrowthState.progress < triggerProgress) return;
      started.current = true;
    }

    elapsed.current += delta;
    const t = Math.min(1, elapsed.current / SCRAMBLE_DURATION);
    const lockedCount = Math.floor(t * text.length);

    let out = '';
    for (let i = 0; i < text.length; i++) {
      out += i < lockedCount || text[i] === ' ' ? text[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }

    mesh.text = out;
    mesh.sync();

    if (t >= 1) settled.current = true;
  });

  return (
    <Text
      ref={textRef as never}
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.02}
    >
      {' '.repeat(text.length)}
    </Text>
  );
}
