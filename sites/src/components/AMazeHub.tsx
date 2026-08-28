import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Star {
  id: number;
  top: string;
  left: string;
  active: boolean;
  title?: string;
  /** Route an active node's "INITIALIZE" CTA navigates to. */
  path?: string;
}

export const STARS: Star[] = [
  { id: 1, top: '85%', left: '20%', active: false },
  { id: 2, top: '60%', left: '15%', active: true, title: 'SPACE ALCHEMY', path: '/sites' }, // Interior Arch
  { id: 3, top: '30%', left: '25%', active: false },
  { id: 4, top: '15%', left: '50%', active: false }, // Top Center
  { id: 5, top: '20%', left: '75%', active: true, title: 'LUMINA', path: '/dental' }, // Dental
  { id: 6, top: '45%', left: '85%', active: false },
  { id: 7, top: '75%', left: '80%', active: false },
];

export default function AmazeHub() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#07080A] text-white">
      {/* Central branding — pointer-events-none so it never blocks
          hovering/clicking the stars scattered beneath it. */}
      <div className="z-10 flex flex-col items-center pointer-events-none text-center">
        <h1 className="font-sans text-5xl font-bold uppercase tracking-tighter text-white md:text-7xl">
          Albatross A/Maze.
        </h1>
        <p className="mt-4 font-mono text-sm uppercase tracking-[0.3em] text-white/50">Archive &amp; Architecture</p>
      </div>

      {/* Constellation nodes — inactive stars are static decoration;
          active ones are hoverable and reveal a card with a route CTA. */}
      {STARS.map((star) => {
        const isHovered = hoveredId === star.id;
        return (
          <div
            key={star.id}
            className="absolute z-20"
            style={{ top: star.top, left: star.left }}
            onMouseEnter={() => star.active && setHoveredId(star.id)}
            onMouseLeave={() => star.active && setHoveredId((current) => (current === star.id ? null : current))}
          >
            <div
              onClick={(e) => {
                if (!star.active) return;
                e.stopPropagation();
                setHoveredId((current) => (current === star.id ? null : star.id));
              }}
              className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                star.active
                  ? `h-3 w-3 cursor-pointer bg-[#66FCF1] ${isHovered ? 'scale-150 shadow-[0_0_16px_4px_rgba(102,252,241,0.6)]' : 'shadow-[0_0_8px_2px_rgba(102,252,241,0.4)]'}`
                  : 'h-1.5 w-1.5 bg-white/30'
              }`}
            />

            {star.active && isHovered && (
              <>
                {/* Mobile-only backdrop: tapping outside the centered card closes it. */}
                <div
                  className="fixed inset-0 z-30 md:hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredId(null);
                  }}
                />
                {/* Centered fixed popup on mobile (never clips off-screen near edge
                    stars); anchored under the dot on desktop, as before. */}
                <div className="glass-panel fixed left-1/2 top-1/2 z-40 w-[85vw] max-w-56 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 p-5 text-center md:absolute md:top-full md:z-30 md:mt-4 md:w-56 md:max-w-none md:translate-y-0">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white">{star.title}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (star.path) navigate(star.path);
                    }}
                    className="mt-4 w-full cursor-pointer rounded-full border border-white/20 py-2 font-mono text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-white/5 hover:text-[#66FCF1]"
                  >
                    Initialize ➔
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
