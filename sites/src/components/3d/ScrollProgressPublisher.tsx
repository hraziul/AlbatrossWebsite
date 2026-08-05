import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { scrollProgressState } from '../../lib/scrollProgressState';

/**
 * Publishes ScrollControls' live offset to the shared scrollProgressState
 * module every frame. Exists purely as a bridge so DOM components outside
 * the Canvas (which can't call useScroll()) can read scroll progress —
 * keeps that concern out of IsometricRoom/PhotorealReveal, which have
 * their own unrelated jobs.
 */
export function ScrollProgressPublisher() {
  const scroll = useScroll();
  useFrame(() => {
    scrollProgressState.offset = scroll.offset;
  });
  return null;
}
