import { useState, useEffect, useRef, useCallback } from 'react';

interface ThemeManifest {
  landscape: string[];
  vertical: string[];
}

interface UseThemeBackgroundResult {
  currentImage: string | null;
  nextImage: string | null;
  isTransitioning: boolean;
}

const MOBILE_BREAKPOINT = 768;
const EXPIRATION_MS = 180_000; // 3 minutes

function pickNext(pool: string[], current: string | null): string | null {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  const candidates = pool.filter(img => img !== current);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function useThemeBackground(): UseThemeBackgroundResult {
  const [manifest, setManifest] = useState<ThemeManifest | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [nextImage, setNextImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentRef = useRef<string | null>(null);
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Fetch manifest on mount
  useEffect(() => {
    // BASE_URL is "/goods/" in production, "/" in dev — matches vite.config.ts's base.
    fetch(`${import.meta.env.BASE_URL}themes/manifest.json`)
      .then(r => r.json())
      .then((data: ThemeManifest) => setManifest(data))
      .catch(() => setManifest({ landscape: [], vertical: [] }));
  }, []);

  const getPool = useCallback((manifestData: ThemeManifest): string[] => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    return isMobile && manifestData.vertical.length > 0
      ? manifestData.vertical
      : manifestData.landscape;
  }, []);

  const advanceTo = useCallback(async (img: string) => {
    setIsTransitioning(true);
    await preloadImage(img);
    setCurrentImage(img);
    currentRef.current = img;
    setTimeout(() => setIsTransitioning(false), 500);
  }, []);

  // Handle session-based background selection
  useEffect(() => {
    if (!manifest) return;

    const pool = getPool(manifest);
    if (pool.length === 0) return;

    const now = Date.now();
    const storedImg = sessionStorage.getItem('ag_session_bg_image');
    const storedTimeStr = sessionStorage.getItem('ag_session_bg_time');
    const storedTime = storedTimeStr ? parseInt(storedTimeStr, 10) : 0;

    let selectedImg = storedImg;

    // Check if session bg has expired (browsing away/time elapsed) or doesn't exist
    const hasExpired = !storedImg || (now - storedTime > EXPIRATION_MS);

    if (hasExpired && !reducedMotion.current) {
      // Pick a new background (avoiding repeating the previous one if pool allows)
      selectedImg = pickNext(pool, storedImg);
      if (selectedImg) {
        sessionStorage.setItem('ag_session_bg_image', selectedImg);
        sessionStorage.setItem('ag_session_bg_time', String(now));
      }
    }

    // Default fallback if session has stored but valid image
    if (!selectedImg || !pool.includes(selectedImg)) {
      selectedImg = pool[0];
    }

    advanceTo(selectedImg);
  }, [manifest, getPool, advanceTo]);

  return { currentImage, nextImage, isTransitioning };
}
