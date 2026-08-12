import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import { Glass3DCards } from '../components/Glass3DCards';
import { PersonalizeBar } from '../components/PersonalizeBar';
import { useBusiness } from '../context/BusinessContext';
import { TEMPLATE_META } from '../lib/copySchemas';

// Gallery-only presentation data (tag/pitch/accent/bento sizing/image) —
// not duplicated anywhere else. Route and label come from copySchemas.ts's
// TEMPLATE_META below, the single source of truth for those two fields.
// Launching strictly with the renovation prototype for now — dental,
// marriage-hall, and fitness stay live at their own routes (still backed
// by copySchemas.ts, untouched here) but are deliberately left out of
// this grid rather than deleted outright.
const GALLERY_DISPLAY = {
  renovation: {
    tag: 'Home Services',
    pitch: 'Portfolio-first, built to close estimate requests.',
    accent: '#B5602B',
    span: 'lg' as const,
    image: '/images/sites.jpg',
  },
};

const TEMPLATE_NICHES = (Object.keys(GALLERY_DISPLAY) as (keyof typeof GALLERY_DISPLAY)[]).map((id) => ({
  id,
  to: TEMPLATE_META[id].route,
  title: TEMPLATE_META[id].label,
  ...GALLERY_DISPLAY[id],
}));

// Bespoke flagship prototypes: fully custom design, not driven by
// copySchemas.ts's TemplateCopy/business-name personalization — so route
// and title are supplied directly here instead of via TEMPLATE_META.
const FLAGSHIP_NICHES = [
  {
    id: 'real-estate',
    to: '/real-estate',
    title: 'Luxury Property Tour',
    tag: 'Real Estate',
    pitch: 'Cinematic scroll-linked architecture showcase.',
    accent: '#8A8578',
    span: 'lg' as const,
    // High-end architecture placeholder — TODO: swap for a licensed asset before ship.
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
  },
];

const NICHES = [...TEMPLATE_NICHES, ...FLAGSHIP_NICHES];

const TAGS = Array.from(new Set(NICHES.map((n) => n.tag)));

export default function Gallery() {
  const navigate = useNavigate();
  const { setBusiness } = useBusiness();
  // State-only phase: businessName drives the hero input, isDropdownOpen
  // will gate the glassmorphic template dropdown once it's built in a
  // later phase — for now, a successful submit just flips it open rather
  // than navigating immediately.
  const [businessName, setBusinessName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [teaserError, setTeaserError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredNiches = useMemo(
    () => (activeTag ? NICHES.filter((n) => n.tag === activeTag) : NICHES),
    [activeTag],
  );

  function handleTeaserSubmit(e: FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) return;
    // Still syncs into BusinessContext (drives the "Viewing as [name]"
    // personalization bar) — dropping this call would silently regress
    // that feature, so it stays even though the dropdown gate itself is
    // now just the trim() check.
    const error = setBusiness({ companyName: businessName, blurb: 'A local business exploring what a real website could look like.' });
    if (error) {
      setTeaserError(error);
      return;
    }
    // Only one niche is live right now (renovation) — skip the picker
    // and land straight on it. Once more niches come off hold, this
    // naturally falls back to the dropdown so the user can choose.
    if (NICHES.length === 1) {
      navigate(`${NICHES[0].to}?brand=${encodeURIComponent(businessName)}`);
    } else {
      setIsDropdownOpen(true);
    }
  }

  function filterButtonClass(active: boolean) {
    return `text-mono rounded-full px-4 py-2 text-xs uppercase tracking-wide transition ${
      active
        ? 'bg-[var(--accent)] text-[var(--obsidian)]'
        : 'glass-panel text-[var(--text-muted)] hover:text-[var(--text-primary)]'
    }`;
  }

  return (
    <div>
      <Nav />

      <section className="relative z-10 px-6 pb-20 pt-16 text-center md:px-12">
        <h1 className="mx-auto mb-6 max-w-3xl font-serif text-5xl leading-tight text-[var(--text-primary)] md:text-7xl">
          Websites for businesses that deserve better than a Facebook page.
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-[var(--text-muted)]">
          Great local businesses lose customers to worse competitors with better websites. Here's what yours
          could look like.
        </p>

        <form
          onSubmit={handleTeaserSubmit}
          className="relative mx-auto flex max-w-md flex-col items-center gap-4 sm:flex-row"
        >
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Type your business name"
            className="glass-panel flex-1 rounded-full px-5 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--obsidian)] transition hover:opacity-90"
          >
            {isDropdownOpen ? 'Choose a Template ↓' : 'See It Live'}
          </button>

          {isDropdownOpen && (
            <ul className="glass-panel absolute left-1/2 top-full z-50 mt-3 w-full max-w-md -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 py-2 text-left">
              {NICHES.map((n) => (
                <li
                  key={n.id}
                  onClick={() => navigate(`${n.to}?brand=${encodeURIComponent(businessName)}`)}
                  className="cursor-pointer px-5 py-3 text-sm text-[var(--text-primary)] transition hover:bg-white/5"
                >
                  {n.title}
                </li>
              ))}
            </ul>
          )}
        </form>
        {teaserError && <p className="mt-3 text-sm text-red-400">{teaserError}</p>}
      </section>

      <div className="relative z-10 mb-8 flex flex-wrap justify-center gap-2 px-6 md:px-12">
        <button onClick={() => setActiveTag(null)} className={filterButtonClass(activeTag === null)}>
          All
        </button>
        {TAGS.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(tag)} className={filterButtonClass(activeTag === tag)}>
            {tag}
          </button>
        ))}
      </div>

      <section className="relative z-10 grid grid-cols-12 gap-6 px-6 pb-24 md:px-12">
        <AnimatePresence mode="popLayout">
          {filteredNiches.map((n) => (
            <Glass3DCards key={n.id} to={n.to} tag={n.tag} title={n.title} pitch={n.pitch} accent={n.accent} span={n.span} image={n.image} />
          ))}
        </AnimatePresence>
      </section>

      <Footer />
      <PersonalizeBar />
    </div>
  );
}
