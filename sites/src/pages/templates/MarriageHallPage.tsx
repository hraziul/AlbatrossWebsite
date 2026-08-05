import { useState } from 'react';
import { Nav } from '../../components/Nav';
import { Footer } from '../../components/Footer';
import { PersonalizeBar } from '../../components/PersonalizeBar';
import { RevealText } from '../../components/RevealText';
import { useTemplateCopy } from '../../hooks/useTemplateCopy';
import { PLACEHOLDER_COPY } from '../../lib/copySchemas';

const TESTIMONIALS = [
  { quote: 'They handled every vendor. We just had to show up and enjoy our own wedding.', name: 'Illustrative example' },
  { quote: 'The room looked like something out of a magazine. Guests are still talking about it.', name: 'Illustrative example' },
];

const CAPACITY_CONFIGS = [
  { guests: 100, layout: 'Intimate round tables, dance floor centered, small stage.' },
  { guests: 250, layout: 'Banquet rows with a dedicated cocktail area and full stage.' },
  { guests: 500, layout: 'Full-hall configuration with tiered seating and dual bars.' },
];

export default function MarriageHallPage() {
  const { copy, isPersonalizing, hasError, errorMessage, retry } = useTemplateCopy('marriage-hall', PLACEHOLDER_COPY['marriage-hall']);
  const [guestIndex, setGuestIndex] = useState(1);
  const config = CAPACITY_CONFIGS[guestIndex];

  return (
    <div className="relative z-10">
      <Nav />

      {hasError && (
        <div className="mx-6 mb-4 flex items-center justify-between rounded-lg bg-red-950/40 px-4 py-3 text-sm text-red-300 md:mx-12">
          <span>{errorMessage}</span>
          <button onClick={retry} className="font-medium underline">Retry personalizing</button>
        </div>
      )}

      {/* Full-bleed spatial hero — the liquid-gold ribbon scene
          (GlobalCanvas, route-aware) shows through behind this text. */}
      <header className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-20 text-center md:px-12">
        <div className="mx-auto max-w-2xl">
          <span className="text-mono mb-4 inline-block rounded-full bg-[#8C1F3B]/15 px-4 py-1 text-xs uppercase tracking-wide text-[#E39AAF]">
            {isPersonalizing ? 'Personalizing…' : 'Marriage & Banquet Hall'}
          </span>
          <h1 className="mb-4 font-serif text-5xl leading-tight text-[var(--text-primary)] md:text-6xl">
            <RevealText value={copy.headline} />
          </h1>
          <p className="mb-8 text-lg text-[var(--text-muted)]">
            <RevealText value={copy.subheadline} />
          </p>
          <button className="rounded-full bg-[#8C1F3B] px-8 py-4 text-sm font-medium text-white transition hover:opacity-90">
            {copy.ctaLabel}
          </button>
          <p className="mt-3 text-xs text-[var(--text-faint)]">{copy.ctaSubtext}</p>
        </div>
      </header>

      <section className="px-6 py-20 md:px-12">
        <h2 className="mb-4 font-serif text-3xl text-[var(--text-primary)]">
          <RevealText value={copy.aboutTitle} />
        </h2>
        <p className="max-w-2xl text-[var(--text-muted)]">
          <RevealText value={copy.aboutBody} />
        </p>
      </section>

      <section className="px-6 py-20 md:px-12">
        <h2 className="mb-2 font-serif text-3xl text-[var(--text-primary)]">How Many Guests Are You Hosting?</h2>
        <p className="mb-8 text-[var(--text-muted)]">Drag to see how the hall configures at your party size.</p>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={guestIndex}
          onChange={(e) => setGuestIndex(Number(e.target.value))}
          className="mb-6 w-full max-w-xl accent-[#8C1F3B]"
        />
        <div className="glass-panel max-w-xl rounded-2xl p-6">
          <p className="mb-1 font-serif text-3xl text-[#E39AAF]">Up to {config.guests} guests</p>
          <p className="text-[var(--text-muted)]">{config.layout}</p>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <h2 className="mb-8 font-serif text-3xl text-[var(--text-primary)]">What's Included</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {copy.services.map((service, i) => (
            <div key={i} className="glass-panel rounded-2xl p-6">
              <h3 className="mb-2 font-serif text-xl text-[var(--text-primary)]">{service.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <h2 className="mb-2 font-serif text-3xl text-[var(--text-primary)]">The Kind of Reviews You'll Start Earning</h2>
        <p className="text-mono mb-8 text-sm text-[var(--text-faint)]">Illustrative examples — not real reviews.</p>
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.quote} className="glass-panel rounded-2xl p-6">
              <p className="mb-3 text-[var(--text-primary)]/80">"{t.quote}"</p>
              <p className="text-mono text-xs text-[var(--text-faint)]">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-12 text-center md:px-12">
        <p className="font-serif text-xl text-[var(--text-primary)]">
          <RevealText value={copy.footerTagline} />
        </p>
      </footer>

      <Footer />
      <PersonalizeBar />
    </div>
  );
}
