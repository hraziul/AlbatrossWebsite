import { useEffect, useRef, useState } from 'react';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#_';
const SCRAMBLE_DURATION = 800;

/**
 * DOM analog of ScrambleText3D (components/3d) — decodes `text` from
 * random technical characters into its final value once the returned
 * `ref` scrolls into view, via IntersectionObserver + requestAnimationFrame.
 * Self-contained (no shared module state), unlike the WebGL version
 * which reads roomGrowthState — this is for plain HTML overlay copy,
 * including content inside a drei <Scroll html> layer: IntersectionObserver
 * still works there since Scroll positions its content via CSS transform,
 * which IO accounts for when computing the intersection rect.
 */
export function useTextScramble<T extends HTMLElement = HTMLElement>(text: string) {
  const [display, setDisplay] = useState(() => ' '.repeat(text.length));
  const ref = useRef<T>(null);
  const startedRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function runScramble() {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / SCRAMBLE_DURATION);
        const lockedCount = Math.floor(t * text.length);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          out += i < lockedCount || text[i] === ' ' ? text[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        setDisplay(out);
        if (t < 1) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();
        runScramble();
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [text]);

  return { ref, display };
}
