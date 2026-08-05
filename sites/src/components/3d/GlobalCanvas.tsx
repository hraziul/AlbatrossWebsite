import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useLocation } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { ParticleNeuralMatrix } from './ParticleNeuralMatrix';
import { NicheShaderHero_Dental } from './NicheShaderHero_Dental';
import { NicheShaderHero_Venue } from './NicheShaderHero_Venue';

/**
 * A single, fixed, full-viewport WebGL canvas mounted once at the app
 * root — it sits behind all page content and never unmounts on route
 * change. `pointer-events-none` so it never intercepts clicks/scroll;
 * Lenis-driven page scroll happens entirely in the DOM layer above it.
 *
 * Content is route-aware: Dental and Marriage Hall each get their own
 * bespoke shader hero; every other route falls back to the generic
 * particle field, which still reacts to isAnyGenerating everywhere else.
 * Renovation is the one exception — it owns its own dedicated Canvas
 * (drei ScrollControls-driven), so this component renders nothing at all
 * on that route rather than running a second, hidden WebGL context.
 *
 * The Bloom pass is the igloo.inc-style glow treatment (see
 * https://www.igloo.inc's raw Three.js + EffectComposer build) ported
 * onto our r3f stack — it reads the Canvas's own alpha:true context, so
 * the transparent background this sits over stays intact.
 */
export function GlobalCanvas() {
  const { isAnyGenerating } = useBusiness();
  const location = useLocation();

  if (location.pathname === '/renovation') return null;

  let content = <ParticleNeuralMatrix active={isAnyGenerating} />;
  if (location.pathname === '/dental') {
    content = <NicheShaderHero_Dental />;
  } else if (location.pathname === '/marriage-hall') {
    content = <NicheShaderHero_Venue />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {content}
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.4} intensity={0.9} mipmapBlur radius={0.6} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
