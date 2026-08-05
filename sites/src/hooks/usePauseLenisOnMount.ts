import { useEffect } from 'react';
import { requestLenisPause, releaseLenisPause } from './useLenis';

/**
 * Pauses the app-wide Lenis smooth-scroll instance for as long as the
 * calling component is mounted, resuming it on unmount. For routes like
 * RenovationPage that drive their own scroll physics (drei's
 * ScrollControls) inside a `fixed inset-0` container — native document
 * scroll is already a no-op there, but Lenis still intercepts wheel
 * events globally, so it needs to explicitly step aside.
 */
export function usePauseLenisOnMount() {
  useEffect(() => {
    requestLenisPause();
    return () => releaseLenisPause();
  }, []);
}
