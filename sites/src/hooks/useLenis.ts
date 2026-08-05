import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Live scroll velocity, updated on every Lenis scroll tick. A plain
 * module-scoped mutable object rather than React state — this changes on
 * every frame during scroll, and anything reading it (e.g. a WebGL
 * component's useFrame loop, deep inside GlobalCanvas) should read it
 * imperatively each frame rather than re-rendering on every tick, the same
 * way r3f's own `state.pointer`/`state.clock` work.
 */
export const scrollState = { velocity: 0 };

/**
 * The live Lenis instance, exposed so routes that own their own scroll
 * physics (e.g. RenovationPage's drei ScrollControls) can pause/resume
 * the app-wide instance rather than fighting it for wheel events. Prefer
 * requestLenisPause()/releaseLenisPause() (via usePauseLenisOnMount) over
 * touching this directly — they also handle the case where a page's pause
 * effect fires before this module's own effect has created the instance.
 */
export const lenisRef: { current: Lenis | null } = { current: null };
let pauseRequested = false;

/**
 * Stops Lenis immediately if it already exists, and records the request
 * so an instance created *after* this call (first mount: React fires
 * child effects before parent effects, so a page's pause effect can run
 * before useLenis's own effect below) still starts paused.
 */
export function requestLenisPause() {
  pauseRequested = true;
  lenisRef.current?.stop();
}

export function releaseLenisPause() {
  pauseRequested = false;
  lenisRef.current?.start();
}

/**
 * Drives inertial smooth scrolling for the whole app via a single Lenis
 * instance, synced to GSAP's ticker (the officially recommended Lenis+GSAP
 * integration — using gsap.ticker instead of a raw requestAnimationFrame
 * loop keeps Lenis and ScrollTrigger from drifting out of sync with each
 * other's frame timing) and wired into ScrollTrigger.update so any
 * ScrollTrigger-based animation elsewhere in the app tracks Lenis's
 * scroll position correctly. Mount once at the app root (App.tsx) — Lenis
 * patches native scroll behavior globally, a second instance would fight
 * the first one for control of the scroll position.
 */
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    if (pauseRequested) lenis.stop();
    lenisRef.current = lenis;

    lenis.on('scroll', (e: { velocity: number }) => {
      scrollState.velocity = e.velocity;
      ScrollTrigger.update();
    });

    function onTick(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
      scrollState.velocity = 0;
    };
  }, []);
}
