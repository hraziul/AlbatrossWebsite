import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane, useTexture } from '@react-three/drei';
import type { MotionValue } from 'motion/react';
import * as THREE from 'three';

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexWire;
  uniform sampler2D uTexRendered;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uResolution;
  uniform vec2 uImageRes;
  varying vec2 vUv;

  void main() {
    // object-fit: cover — the plane's own UVs (vUv) match the screen's
    // aspect ratio exactly (it's sized to viewport.width/height), but
    // the source images are a fixed 16:9, so sampling with raw vUv
    // would stretch them. This remaps into image-space UVs that crop.
    vec2 ratio = vec2(
      min((uResolution.x / uResolution.y) / (uImageRes.x / uImageRes.y), 1.0),
      min((uResolution.y / uResolution.x) / (uImageRes.y / uImageRes.x), 1.0)
    );
    vec2 correctedUv = vec2(vUv.x - 0.5, vUv.y - 0.5) * ratio + 0.5;

    // renovation-wire.png has black letterbar padding baked into the
    // source composition — punch in 15% and re-center to crop it out.
    // Only the wire sample gets this; uTexRendered has no such padding.
    vec2 wireUv = (correctedUv - 0.5) * 0.85 + 0.5;
    vec4 wireColor = texture2D(uTexWire, wireUv);
    vec4 renderedColor = texture2D(uTexRendered, correctedUv);

    // Ambient firelight: two sine waves at different rates/phases summed
    // together, rather than one clean oscillation, so the flicker reads
    // as erratic flame light rather than a metronomic strobe. Combined
    // amplitude keeps the multiplier within roughly 0.95-1.05.
    float flicker = 1.0 + 0.03 * sin(uTime * 8.0) + 0.02 * sin(uTime * 17.3 + 1.5);
    vec4 renderedColorWithFlicker = vec4(renderedColor.rgb * flicker, renderedColor.a);

    // Razor-sharp diagonal wipe: a true step() (not smoothstep) for a
    // hard, unblurred edge, using the raw screen-space vUv (not
    // correctedUv, which would skew the wipe angle by the image's aspect
    // ratio instead of the screen's). vUv.x + (1.0 - vUv.y) is 0 at the
    // top-left corner (x=0, y=1) and 2 at the bottom-right — anchoring
    // the wipe's low end to the top-left so the corner peek lands there.
    float diagonal = vUv.x + (1.0 - vUv.y);
    // Threshold affordance: bottoms out at 0.0 so a raw uScroll of 0
    // (modal open, no scroll, no cinematic offset) yields zero area —
    // locked 100% wireframe. The JS-side cinematic base offset (see
    // PhotorealReveal's useFrame) is what actually produces the ~10-15%
    // corner peek once the modal closes; this threshold just needs to
    // scale that offset into a proportional triangle area. At uScroll 1
    // it clears past the diagonal's max (2.0), revealing 100%.
    float threshold = mix(0.0, 4.0, uScroll);
    float mask = step(diagonal, threshold);

    gl_FragColor = mix(wireColor, renderedColorWithFlicker, mask);
  }
`;

interface PhotorealRevealProps {
  /** 0-1 scroll progress, piped in from RenovationPage's own Framer
   * Motion useScroll() rather than read via drei's useScroll — this
   * component no longer assumes it's inside a <ScrollControls>. */
  scrollProgress: MotionValue<number>;
  /** Whether the Customize modal is open — drives the cinematic base
   * offset below (locked wireframe while open, a scroll affordance
   * peek once closed). */
  isModalOpen: boolean;
}

/**
 * A single full-screen shader plane driving the Renovation page's
 * visual: a razor-sharp angled wipe from the wire texture to the
 * rendered texture, driven by native-scroll progress passed in as a
 * prop (scrollProgress.get(), read imperatively each frame) rather than
 * drei's useScroll(), since this Canvas no longer sits inside a
 * <ScrollControls>. The rendered texture gets a subtle procedural
 * firelight flicker so the static room still feels alive.
 */
export function PhotorealReveal({ scrollProgress, isModalOpen }: PhotorealRevealProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const viewport = useThree((state) => state.viewport);
  const [wireTex, renderedTex] = useTexture([
    `${import.meta.env.BASE_URL}textures/renovation-wire.png`,
    `${import.meta.env.BASE_URL}textures/renovation-rendered.png`,
  ]);
  // Cinematic base offset: locked at 0.0 (pure wireframe) while the
  // modal is open, damping to 0.12 (a scroll affordance peek) once it
  // closes. Real scroll progress adds on top of this baseline.
  const baseOffset = useRef(0.0);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    // If modal is open, target is 0.0 (pure wireframe).
    // If closed, target is 0.12 (our 10-15% cinematic peek).
    const targetOffset = isModalOpen ? 0.0 : 0.12;
    baseOffset.current = THREE.MathUtils.damp(baseOffset.current, targetOffset, 3.0, delta);

    // The final uniform value is the physical scroll PLUS our cinematic base offset
    const finalScroll = scrollProgress.get() + baseOffset.current;
    materialRef.current.uniforms.uScroll.value = finalScroll;
    // Kept in sync every frame (not just on mount) so a window resize
    // updates the cover-crop math too, not just the plane's own size.
    materialRef.current.uniforms.uResolution.value.set(viewport.width, viewport.height);
  });

  return (
    <Plane args={[viewport.width, viewport.height]}>
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTexWire: { value: wireTex },
          uTexRendered: { value: renderedTex },
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
          uImageRes: { value: new THREE.Vector2(1920, 1080) },
        }}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
      />
    </Plane>
  );
}
