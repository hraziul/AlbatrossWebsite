import { useEffect, useState } from 'react';
import { scrollProgressState } from '../lib/scrollProgressState';

/**
 * Polls the shared scrollProgressState (published every r3f frame by
 * ScrollProgressPublisher, inside the Canvas) via requestAnimationFrame
 * and returns it as reactive state for plain DOM components outside the
 * Canvas — useScroll() itself only works inside the r3f render tree.
 */
export function useScrollProgress() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      setOffset((prev) => (prev === scrollProgressState.offset ? prev : scrollProgressState.offset));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return offset;
}
