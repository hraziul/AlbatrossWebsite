import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform } from 'motion/react';
import { PhotorealReveal } from '../../components/3d/PhotorealReveal';

const PROGRESS_STEPS = ['01', '02', '03', '04', '05'];

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

/**
 * Glassmorphism input modal for the (not-yet-implemented) brand
 * customization flow — UI/state scaffolding only, per this task's scope.
 * onSubmit currently just console.logs; the real Gemini call is a later
 * task.
 */
function CustomizeModal({ isOpen, onClose, onSubmit }: CustomizeModalProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // A tiny timeout so the DOM has fully painted the input before we try
  // to focus it — a same-tick focus() call can silently no-op on some
  // browsers when it races the element's own initial paint.
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md border border-white/10 bg-[#0A0B0E] p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-widest text-white">Customize Experience</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer font-mono text-white/50 transition-colors hover:text-[#66FCF1]"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(inputValue);
            onClose();
          }}
        >
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-white/40">
            Enter your Brand Name or Industry (e.g., 'Aura Tech' or 'Luxury Watches')
          </label>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. Aura Tech"
            className="mb-8 w-full border-b border-white/20 bg-transparent py-2 font-mono text-sm text-white outline-none transition-colors focus:border-[#66FCF1]"
          />

          <button
            type="submit"
            className="w-full cursor-pointer rounded-full border border-white/20 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white/5 hover:text-[#66FCF1]"
          >
            Generate ➔
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Native document scroll (via motion's useScroll(), tracked once here)
 * drives the WebGL shader wipe — no drei <ScrollControls>, no competing
 * scroll container for Lenis to fight. PhotorealReveal reads
 * scrollProgress.get() imperatively in its own useFrame loop rather than
 * depending on drei's useScroll().
 *
 * The HTML overlay (nav + hero + left-axis tracker) lives inside a
 * sticky wrapper nested in the 300vh scroll container — position:sticky
 * pins it to the viewport for the whole scroll range.
 */
export default function RenovationPage() {
  const { scrollYProgress } = useScroll();

  // A ?brand= query param means the visitor already filled out the
  // Sites hub's teaser form and picked this template from the dropdown
  // — the handoff carries their business name straight through, so the
  // modal can stay closed and drop them right into the experience.
  const searchParams = new URLSearchParams(window.location.search);
  const urlBrand = searchParams.get('brand');

  // Dynamic copy state — UI/state layer for the customize feature. Not
  // yet wired to a real generation call; CustomizeModal's onSubmit just
  // logs for now, per this task's explicit scope.
  const [brandName, setBrandName] = useState(urlBrand || 'AELIYA DESIGNS');
  const [copyWireframe, setCopyWireframe] = useState('WE SHAPE RAW SPACES.');
  const [copyRendered, setCopyRendered] = useState('INTO SPACES YOU LOVE TO LIVE IN.');
  const [isModalOpen, setIsModalOpen] = useState(urlBrand ? false : true);

  // Chrome restores the native scrollY from history on reload by default
  // (history.scrollRestoration === 'auto'), independent of this
  // component's own state resetting to its initial values — a reload
  // while scrolled deep into the page desyncs the two, making the
  // shader read a high uScroll (mostly-rendered) on what looks like a
  // fresh page load. Forcing manual restoration once, plus a top-of-page
  // scroll tied to isModalOpen, keeps every load (and every modal open)
  // starting from true scroll 0.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Optional: Lock scrolling completely while modal is open
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isModalOpen]);

  // Kinetic Cross-Stack: keyframe arrays explicitly cover the full 0-1
  // scroll range and lock their trailing values flat (repeated endpoints)
  // rather than leaving them open past the last keyframe — an unclamped
  // range snaps back to its first/last output the instant scroll re-enters
  // it, which read as the text "reappearing"/looping on scroll-back.
  const opacityWire = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35, 1], [1, 1, 0, 0, 0]);
  const yWire = useTransform(scrollYProgress, [0, 0.35, 1], [0, -40, -40]);
  const opacityRender = useTransform(scrollYProgress, [0, 0.25, 0.35, 1], [0, 0, 1, 1]);
  const yRender = useTransform(scrollYProgress, [0, 0.25, 0.45, 1], [40, 40, 0, 0]);

  return (
    <div className="relative w-full bg-[#07080A]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <PhotorealReveal scrollProgress={scrollYProgress} isModalOpen={isModalOpen} />
        </Canvas>
      </div>

      <div className="relative z-10 h-[300vh] w-full">
        <div className="sticky top-0 left-0 z-20 flex h-screen w-full flex-col p-6 pointer-events-none md:p-10">
          <a
            href={import.meta.env.BASE_URL}
            className="pointer-events-auto absolute left-6 top-6 z-50 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-[#66FCF1] md:left-10 md:top-8"
          >
            <span>←</span>
            <span>BACK TO SITES</span>
          </a>

          {/* Nav bar — nudged down so it clears the Back to Sites link
              above it instead of the two absolutely-positioned corner
              elements overlapping. */}
          <div className="relative mt-8 flex w-full items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#66FCF1]" />
              <span className="font-mono text-xs uppercase tracking-widest text-white">{brandName}</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="pointer-events-auto absolute left-1/2 -translate-x-1/2 cursor-pointer rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-widest text-white/50 transition-colors hover:bg-white/5 hover:text-[#66FCF1]"
            >
              [ Customize ]
            </button>

            <span className="pointer-events-auto cursor-pointer font-mono text-xs uppercase tracking-widest text-white transition-colors hover:text-[#66FCF1]">
              Menu +
            </span>
          </div>

          {/* Hero typography — a Kinetic Cross-Stack: two motion layers
              occupying the same centered footprint, crossfading from the
              technical (wireframe) copy to the warm (rendered) copy in
              sync with the shader wipe, then clearing entirely to let the
              final render breathe. */}
          <div className="relative flex flex-1 items-center justify-center px-6 text-center">
            <motion.p
              style={{ opacity: opacityWire, y: yWire }}
              className="font-serif text-[8vw] font-bold uppercase leading-none text-white md:text-[6vw]"
            >
              {copyWireframe}
            </motion.p>
            <motion.div
              style={{ opacity: opacityRender, y: yRender }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <span className="font-sans text-4xl font-bold uppercase text-[#E0A16E] md:text-6xl">{copyRendered}</span>
              <span className="font-mono text-2xl md:text-4xl font-bold tracking-[0.2em] text-white mt-6 md:mt-10 uppercase">BY {brandName}</span>
            </motion.div>
          </div>

          {/* Left-axis progress tracker — static for now, wired to
              useScroll in a later phase. */}
          <div className="absolute left-6 top-1/2 flex -translate-y-1/2 flex-col gap-4 font-mono text-xs text-white/30 md:left-10">
            {PROGRESS_STEPS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <CustomizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(value) => {
          // No Gemini call yet, per this task's scope — but leaving the
          // state setters genuinely unused fails the build
          // (noUnusedLocals), and it's a reasonable interim echo of the
          // input anyway: a real generation call would presumably update
          // this same state once it lands.
          console.log('Customize submit:', value);
          if (!value.trim()) return;
          const normalized = value.trim().toUpperCase();
          setBrandName(normalized);
          setCopyWireframe('WE SHAPE RAW SPACES.');
          setCopyRendered('INTO SPACES YOU LOVE TO LIVE IN.');
        }}
      />
    </div>
  );
}
