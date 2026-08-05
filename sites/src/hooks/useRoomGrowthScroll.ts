import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { roomGrowthState } from '../lib/roomGrowthState';

/**
 * Drives the Renovation room's wireframe→solid growth from scroll
 * position. Attach the returned ref to a tall DOM section; as the user
 * scrolls through it, roomGrowthState.progress sweeps 0→1 and
 * NicheShaderHero_Architecture reads it each frame to scale/solidify the
 * mesh. Scrub-linked rather than pinned — pinning fights Lenis's own
 * transform-based smoothing, while scrub is just a progress readout and
 * plays nicely with it. ScrollTrigger.registerPlugin already happens
 * once at import time in useLenis.ts, which mounts before any page.
 */
export function useRoomGrowthScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        roomGrowthState.progress = self.progress;
      },
    });

    return () => {
      trigger.kill();
      roomGrowthState.progress = 0;
    };
  }, []);

  return sectionRef;
}
