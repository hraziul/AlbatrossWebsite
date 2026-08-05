import { useRef, useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface Glass3DCardsProps {
  to: string;
  tag: string;
  title: string;
  pitch: string;
  accent: string;
  /** Bento sizing hint — a stable, per-niche value (not derived from array
   * index) so the grid's asymmetric layout doesn't reshuffle unexpectedly
   * when category filtering changes which cards are visible. */
  span: 'md' | 'lg';
  /** Optional background photo, served from /public — the card still
   * reads fine without one (existing gradient-only niches). */
  image?: string;
}

// Perceived-brightness formula: light accents (e.g. Fitness's neon lime)
// need dark tag text; dark accents need white — same technique the
// original GalleryCard used, carried over here since this component
// replaces it.
function readableTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? '#141311' : '#FFFFFF';
}

/**
 * A glassmorphic bento card with mouse-driven 3D tilt (CSS 3D transforms
 * via Framer Motion — not literal WebGL geometry: this card is a real
 * clickable <Link> with text content, and projecting DOM into a 3D canvas
 * via drei's <Html> would add real fragility for no visual gain over the
 * standard tilt-card technique used here).
 */
export function Glass3DCards({ to, tag, title, pitch, accent, span, image }: Glass3DCardsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: py * -10, y: px * 10 });
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`col-span-12 ${span === 'lg' ? 'md:col-span-7' : 'md:col-span-5'}`}
      style={{ perspective: 1000 }}
    >
      <Link to={to} className="block h-full">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ rotateX: rotate.x, rotateY: rotate.y }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="glass-panel group relative flex h-[320px] flex-col justify-end overflow-hidden rounded-3xl p-6"
        >
          {image && (
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center transition duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${image})` }}
            />
          )}
          <div
            className="absolute inset-0 opacity-40 transition duration-500 group-hover:opacity-60"
            style={{ background: `linear-gradient(135deg, ${accent}55, transparent 70%)` }}
          />
          {image && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />}
          <div className="relative">
            <span
              className="text-mono mb-2 inline-block rounded-full px-3 py-1 text-xs uppercase tracking-wide"
              style={{ backgroundColor: accent, color: readableTextColor(accent) }}
            >
              {tag}
            </span>
            <h3 className="mb-1 font-serif text-2xl text-[var(--text-primary)]">{title}</h3>
            <p className="mb-3 text-sm text-[var(--text-muted)]">{pitch}</p>
            <span className="text-sm font-medium text-[var(--text-primary)] underline-offset-4 group-hover:underline">
              View Demo →
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
